// src/utils/RealtimePollingManager.ts
interface PollingConfig {
    fetchData: () => Promise<void>;
    lastUpdateTime: number;
    onError?: (error: any, consecutiveErrors: number) => void;
    onSuccess?: () => void;
    onActivityDetected?: () => void;
    onInactivityDetected?: () => void;
}

export class RealtimePollingManager {
    private pollingInterval: NodeJS.Timeout | null = null;
    private retryTimeout: NodeJS.Timeout | null = null;
    private isActive = true;
    private consecutiveErrors = 0;
    private isPolling = false;
    private config: PollingConfig;

    constructor(config: PollingConfig) {
        this.config = config;
    }

    start(): void {
        if (!this.isActive || this.isPolling) return;
        
        console.log('🔄 [RealtimePollingManager] Starting smart polling...');
        this.startFrequentPolling();
    }

    private startFrequentPolling(): void {
        this.pollingInterval = setInterval(() => {
            this.pollData();
        }, 5000); // 5 seconds
    }

    private startSlowPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(() => {
            this.pollData();
        }, 30000); // 30 seconds
    }

    private async pollData(): Promise<void> {
        if (!this.isActive || this.isPolling) return;
        
        try {
            this.isPolling = true;
            console.log('🔄 [RealtimePollingManager] Polling data...');
            
            await this.config.fetchData();
            
            // Reset error counter on success
            this.consecutiveErrors = 0;
            this.config.onSuccess?.();
            
            // Check activity level
            this.checkActivityLevel();
            
        } catch (error) {
            this.handlePollingError(error);
        } finally {
            this.isPolling = false;
        }
    }

    private checkActivityLevel(): void {
        const timeSinceLastUpdate = Date.now() - this.config.lastUpdateTime;
        
        if (timeSinceLastUpdate < 60000) { // Less than 1 minute
            console.log('📦 [RealtimePollingManager] Recent activity detected');
            this.config.onActivityDetected?.();
        } else {
            console.log('⏰ [RealtimePollingManager] No recent activity, switching to slow polling');
            this.config.onInactivityDetected?.();
            this.startSlowPolling();
        }
    }

    private handlePollingError(error: any): void {
        this.consecutiveErrors++;
        this.config.onError?.(error, this.consecutiveErrors);
        
        // Exponential backoff for consecutive errors
        if (this.consecutiveErrors >= 3) {
            this.startExponentialBackoff();
        }
    }

    private startExponentialBackoff(): void {
        const backoffTime = Math.min(
            30000 * Math.pow(2, this.consecutiveErrors - 3), 
            300000 // Max 5 minutes
        );
        
        console.log(`⏰ [RealtimePollingManager] Backing off for ${backoffTime}ms`);
        
        this.stopPolling();
        
        this.retryTimeout = setTimeout(() => {
            if (this.isActive) {
                console.log('🔄 [RealtimePollingManager] Retrying after backoff...');
                this.start();
            }
        }, backoffTime);
    }

    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    pause(): void {
        console.log('⏸️ [RealtimePollingManager] Pausing polling...');
        this.stopPolling();
    }

    resume(): void {
        if (this.isActive) {
            console.log('▶️ [RealtimePollingManager] Resuming polling...');
            this.startFrequentPolling();
        }
    }

    cleanup(): void {
        console.log('🧹 [RealtimePollingManager] Cleaning up...');
        
        this.isActive = false;
        this.isPolling = false;
        
        this.stopPolling();
        
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    }
}
