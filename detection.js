/**
 * Detection API — stub for plugging in a CV or ML backend.
 *
 * Usage (Python/Flask backend example):
 *
 *   DetectionAPI.connect(async () => {
 *       const res = await fetch('http://localhost:5000/detect');
 *       return res.json();
 *   });
 *
 * The fetch function must return an object shaped like:
 *   {
 *     balls: [
 *       { color: 'red',    x: 120, y: 200 },
 *       { color: 'white',  x: 300, y: 150 },
 *       ...
 *     ]
 *   }
 *
 * Call DetectionAPI.disconnect() to stop polling.
 */
const DetectionAPI = (() => {
    let _fetchFn    = null;
    let _intervalId = null;
    let _onFrame    = null;

    function _setStatus(msg, cls = '') {
        const el = document.getElementById('detection-status');
        if (!el) return;
        el.textContent = msg;
        el.className = `detection-status ${cls}`.trim();
    }

    return {
        /**
         * Start polling the backend.
         * @param {() => Promise<{balls: Array}>} fetchFn  async function that fetches detection results
         * @param {number} intervalMs  polling interval in ms (default 100)
         */
        connect(fetchFn, intervalMs = 100) {
            if (_intervalId) clearInterval(_intervalId);  // guard against double-connect
            _fetchFn = fetchFn;
            _setStatus('Detection: connecting…');
            _intervalId = setInterval(async () => {
                try {
                    const data = await _fetchFn();
                    if (_onFrame) _onFrame(data);
                    _setStatus(`Detection: active — ${data.balls?.length ?? 0} ball(s) found`, 'active');
                } catch (err) {
                    _setStatus(`Detection error: ${err.message}`, 'error');
                }
            }, intervalMs);
        },

        disconnect() {
            clearInterval(_intervalId);
            _intervalId = null;
            _fetchFn    = null;
            _setStatus('');
        },

        /**
         * Register a callback that receives each detection frame.
         * The canvas layer in sketch.js can call this to overlay detected balls.
         * @param {(frame: {balls: Array}) => void} callback
         */
        onFrame(callback) {
            _onFrame = callback;
        },

        get isConnected() { return _intervalId !== null; },
    };
})();
