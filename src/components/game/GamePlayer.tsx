'use client';

/**
 * GamePlayer — embeds the HTML5 game in an iframe.
 *
 * Protocol (postMessage API between game iframe and host):
 *   Host → Game:  { type: 'GAME_START', nonce, sessionId, maxScore }
 *   Game → Host:  { type: 'GAME_SCORE', score: number }
 *   Game → Host:  { type: 'GAME_QUIT' }
 *
 * The host intercepts the GAME_SCORE message, POSTs it to /api/games/score
 * (server-validates), and shows the result. Games never POST scores directly
 * to the server — all score submissions go through this trusted host frame.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface GamePlayerProps {
  gameId: string;
  gameName: string;
  onClose: () => void;
}

type Phase = 'loading' | 'playing' | 'submitting' | 'result' | 'error';

interface GameResult {
  finalScore: number;
  pointsAwarded: number;
  isPersonalBest: boolean;
  status: string;
}

export function GamePlayer({ gameId, gameName, onClose }: GamePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [bundleUrl, setBundleUrl] = useState<string>('');
  const [maxScore, setMaxScore] = useState<number>(0);

  // Store session info from the start call
  const sessionRef = useRef<{ gameSessionId: string; nonce: string } | null>(null);

  // Start the game session on mount
  useEffect(() => {
    async function startSession() {
      try {
        const res = await fetch('/api/games/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message ?? data.error ?? 'Failed to start game.');
          setPhase('error');
          return;
        }
        sessionRef.current = { gameSessionId: data.gameSessionId, nonce: data.nonce };
        setBundleUrl(data.game?.bundleUrl ?? '');
        setMaxScore(data.game?.maxScore ?? 0);
        setPhase('playing');
      } catch {
        setError('Network error. Please try again.');
        setPhase('error');
      }
    }
    startSession();
  }, [gameId]);

  // Post start message to iframe once playing and iframe loaded
  const handleIframeLoad = useCallback(() => {
    if (phase !== 'playing' || !sessionRef.current || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'GAME_START',
        nonce: sessionRef.current.nonce,
        sessionId: sessionRef.current.gameSessionId,
        maxScore,
      },
      '*',
    );
  }, [phase, maxScore]);

  // Listen for score / quit messages from the game iframe
  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (!sessionRef.current) return;
      if (event.data?.type === 'GAME_QUIT') {
        // Abandon session
        await fetch('/api/games/abandon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameSessionId: sessionRef.current.gameSessionId }),
        }).catch(() => null);
        onClose();
        return;
      }

      if (event.data?.type === 'GAME_SCORE') {
        const rawScore = typeof event.data.score === 'number' ? event.data.score : 0;
        setPhase('submitting');
        try {
          const res = await fetch('/api/games/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameSessionId: sessionRef.current.gameSessionId,
              nonce: sessionRef.current.nonce,
              score: rawScore,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.message ?? 'Score submission failed.');
            setPhase('error');
          } else {
            setResult(data);
            setPhase('result');
          }
        } catch {
          setError('Failed to submit score.');
          setPhase('error');
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
        <span className="font-semibold text-white">{gameName}</span>
        <button
          type="button"
          onClick={async () => {
            if (sessionRef.current && phase === 'playing') {
              await fetch('/api/games/abandon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameSessionId: sessionRef.current.gameSessionId }),
              }).catch(() => null);
            }
            onClose();
          }}
          className="rounded-md px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          aria-label="Close game"
        >
          ✕ Exit
        </button>
      </div>

      {/* Game area */}
      <div className="flex flex-1 items-center justify-center">
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-white">
            <LoadingSpinner size="lg" color="text-brand-400" label="Starting game…" />
            <p className="text-sm text-gray-300">Starting game…</p>
          </div>
        )}

        {phase === 'playing' && (
          <iframe
            ref={iframeRef}
            src={bundleUrl}
            onLoad={handleIframeLoad}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title={gameName}
          />
        )}

        {phase === 'submitting' && (
          <div className="flex flex-col items-center gap-3 text-white">
            <LoadingSpinner size="lg" color="text-brand-400" label="Saving score…" />
            <p className="text-sm text-gray-300">Saving your score…</p>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="flex flex-col items-center gap-6 text-center text-white max-w-sm mx-auto px-4">
            <div className="text-6xl">
              {result.status === 'COMPLETED' ? '🎉' : '😅'}
            </div>
            <div>
              <p className="text-2xl font-bold">{result.finalScore.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Final Score</p>
            </div>
            {result.pointsAwarded > 0 && (
              <div className="rounded-xl bg-brand-700 px-6 py-3">
                <p className="text-lg font-bold text-brand-200">+{result.pointsAwarded} points</p>
              </div>
            )}
            {result.isPersonalBest && (
              <div className="flex items-center gap-2 rounded-xl bg-yellow-500/20 px-4 py-2">
                <span>⭐</span>
                <p className="text-sm font-medium text-yellow-300">New Personal Best!</p>
              </div>
            )}
            {result.status === 'INVALID' && (
              <p className="text-sm text-red-400">Score was flagged by the anti-cheat system.</p>
            )}
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  sessionRef.current = null;
                  setPhase('loading');
                  setResult(null);
                  // Re-trigger start
                  fetch('/api/games/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId }),
                  }).then((r) => r.json()).then((data) => {
                    if (data.gameSessionId) {
                      sessionRef.current = { gameSessionId: data.gameSessionId, nonce: data.nonce };
                      setPhase('playing');
                    } else {
                      setError(data.message ?? 'Failed to restart.');
                      setPhase('error');
                    }
                  }).catch(() => { setError('Network error.'); setPhase('error'); });
                }}
                className="flex-1"
                variant="secondary"
              >
                Play Again
              </Button>
              <Button onClick={onClose} className="flex-1">Done</Button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center text-white max-w-sm mx-auto px-4">
            <span className="text-5xl">⚠️</span>
            <p className="text-base font-semibold">{error ?? 'Something went wrong.'}</p>
            <Button onClick={onClose} variant="secondary">Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
