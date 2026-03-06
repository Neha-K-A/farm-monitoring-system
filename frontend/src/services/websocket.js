class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 1; // OPEN
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;

        console.log(`[MockWebSocket] Connected to mock stream for ${url}`);

        // Trigger onopen asynchronously
        setTimeout(() => {
            if (typeof this.onopen === 'function') {
                this.onopen(new Event('open'));
            }
        }, 100);

        // Start emitting mock IoT data every 2 seconds
        this.interval = setInterval(() => {
            if (typeof this.onmessage === 'function') {
                const payload = this.generateMockData();
                const event = new MessageEvent('message', {
                    data: JSON.stringify({ type: 'iot_update', payload }),
                });
                this.onmessage(event);
            }
        }, 2000);
    }

    generateMockData() {
        return {
            moisture: Math.floor(Math.random() * (75 - 50 + 1) + 50),
            temperature: Math.floor(Math.random() * (35 - 20 + 1) + 20),
            humidity: Math.floor(Math.random() * (85 - 40 + 1) + 40),
            phLevel: (Math.random() * (7.5 - 6.0) + 6.0).toFixed(1),
            lightIntensity: Math.floor(Math.random() * (1000 - 400 + 1) + 400),
            waterTank: Math.floor(Math.random() * (100 - 30 + 1) + 30),
            cropHealth: Math.floor(Math.random() * (100 - 75 + 1) + 75),
        };
    }

    close() {
        this.readyState = 3; // CLOSED
        clearInterval(this.interval);
        console.log(`[MockWebSocket] Disconnected from mock stream for ${this.url}`);
        if (typeof this.onclose === 'function') {
            this.onclose(new Event('close'));
        }
    }

    send(data) {
        console.log(`[MockWebSocket] Received message: ${data}`);
    }
}

class WebSocketService {
    constructor() {
        this.ws = null;
        this.subscribers = new Set();
        this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.retryTimeout = null;
        this.isMocking = false;
    }

    connect() {
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                return;
            }
            this.ws.close();
        }

        if (this.isMocking) {
            this.startMock();
            return;
        }

        try {
            console.log(`[WebSocketService] Connecting to ${this.url}`);
            this.ws = new WebSocket(this.url);

            this.ws.onopen = (event) => {
                console.log('[WebSocketService] Connected successfully');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifySubscribers(data);
                } catch (err) {
                    console.error('[WebSocketService] Failed to parse message:', err);
                }
            };

            this.ws.onclose = () => {
                console.log('[WebSocketService] Disconnected');
                this.handleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('[WebSocketService] Error observed:', error);
            };
        } catch (err) {
            console.error('[WebSocketService] Connection error:', err);
            this.handleReconnect();
        }
    }

    handleReconnect() {
        if (this.isMocking) return;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts += 1;
            const delayMs = Math.min(2000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
            console.log(`[WebSocketService] Reconnecting in ${delayMs}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            if (this.retryTimeout) clearTimeout(this.retryTimeout);
            this.retryTimeout = setTimeout(() => this.connect(), delayMs);
        } else {
            console.warn('[WebSocketService] Backend unreachable. Falling back to simulated dummy data generator.');
            this.startMock();
        }
    }

    startMock() {
        this.isMocking = true;
        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.close();
        }
        this.ws = new MockWebSocket(this.url);
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifySubscribers(data);
            } catch (err) { }
        };
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    notifySubscribers(data) {
        this.subscribers.forEach((callback) => callback(data));
    }

    disconnect() {
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const wsService = new WebSocketService();
export default wsService;
