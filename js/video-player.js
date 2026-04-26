/**
 * 视频播放器组件 - Video Player Component
 * 用于纪录片模块的视频播放控制
 */

class VideoPlayer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.options = {
            src: '',
            poster: '',
            title: '',
            autoplay: false,
            ...options
        };
        
        this.video = null;
        this.isPlaying = false;
        this.isFullscreen = false;
        this.currentTime = 0;
        this.duration = 0;
        
        this.init();
    }
    
    /**
     * 初始化播放器
     */
    init() {
        this.createPlayer();
        this.bindEvents();
    }
    
    /**
     * 创建播放器DOM
     */
    createPlayer() {
        const playerHTML = `
            <div class="video-player-wrapper">
                <video class="video-player" 
                       ${this.options.poster ? `poster="${this.options.poster}"` : ''}
                       preload="metadata">
                    <source src="${this.options.src}" type="video/mp4">
                    您的浏览器不支持视频播放，请升级浏览器
                </video>
                
                <!-- 加载动画 -->
                <div class="video-loading" id="videoLoading">
                    <div class="loading-spinner"></div>
                </div>
                
                <!-- 播放按钮覆盖层 -->
                <div class="video-play-overlay" id="playOverlay">
                    <button class="video-play-btn">▶</button>
                </div>
                
                <!-- 错误提示 -->
                <div class="video-error" id="videoError" style="display: none;">
                    <div class="error-icon">⚠</div>
                    <div class="error-text">视频加载失败</div>
                    <button class="error-retry" onclick="videoPlayer.reload()">重新加载</button>
                </div>
                
                <!-- 控制栏 -->
                <div class="video-controls-bar" id="videoControls">
                    <button class="control-btn play-btn" id="playBtn">▶</button>
                    
                    <div class="progress-wrapper">
                        <div class="progress-bar" id="progressBar">
                            <div class="progress-fill" id="progressFill"></div>
                            <div class="progress-handle" id="progressHandle"></div>
                        </div>
                        <div class="time-display">
                            <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                        </div>
                    </div>
                    
                    <div class="volume-wrapper">
                        <button class="control-btn volume-btn" id="volumeBtn">🔊</button>
                        <div class="volume-slider" id="volumeSlider">
                            <div class="volume-fill" id="volumeFill"></div>
                        </div>
                    </div>
                    
                    <button class="control-btn fullscreen-btn" id="fullscreenBtn">⛶</button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = playerHTML;
        this.video = this.container.querySelector('.video-player');
        
        // 添加自定义样式
        this.addStyles();
    }
    
    /**
     * 添加播放器样式
     */
    addStyles() {
        if (document.getElementById('video-player-styles')) return;
        
        const styles = `
            <style id="video-player-styles">
                .video-player-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    overflow: hidden;
                }
                
                .video-player {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .video-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.5);
                    z-index: 10;
                }
                
                .video-loading.hidden {
                    display: none;
                }
                
                .video-play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.3);
                    cursor: pointer;
                    z-index: 5;
                    transition: opacity 0.3s ease;
                }
                
                .video-play-overlay.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                
                .video-play-btn {
                    width: 80px;
                    height: 80px;
                    background: rgba(91, 164, 201, 0.9);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 32px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                
                .video-play-btn:hover {
                    transform: scale(1.1);
                    background: rgba(91, 164, 201, 1);
                }
                
                .video-error {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    z-index: 20;
                }
                
                .video-error .error-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .video-error .error-text {
                    font-size: 16px;
                    margin-bottom: 16px;
                }
                
                .video-error .error-retry {
                    padding: 10px 24px;
                    background: var(--primary, #5BA4C9);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                
                .video-error .error-retry:hover {
                    background: var(--primary-light, #A8D8EA);
                }
                
                .video-controls-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 15;
                }
                
                .video-player-wrapper:hover .video-controls-bar,
                .video-controls-bar.show {
                    opacity: 1;
                }
                
                .control-btn {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }
                
                .control-btn:hover {
                    background: var(--primary, #5BA4C9);
                }
                
                .progress-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .progress-bar {
                    height: 4px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    cursor: pointer;
                    position: relative;
                }
                
                .progress-fill {
                    height: 100%;
                    background: var(--primary, #5BA4C9);
                    border-radius: 2px;
                    width: 0%;
                    transition: width 0.1s linear;
                }
                
                .progress-handle {
                    position: absolute;
                    top: 50%;
                    left: 0%;
                    transform: translate(-50%, -50%);
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .progress-bar:hover .progress-handle {
                    opacity: 1;
                }
                
                .time-display {
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
                }
                
                .volume-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .volume-slider {
                    width: 60px;
                    height: 4px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    cursor: pointer;
                }
                
                .volume-fill {
                    height: 100%;
                    background: white;
                    border-radius: 2px;
                    width: 70%;
                }
                
                @media (max-width: 768px) {
                    .video-play-btn {
                        width: 60px;
                        height: 60px;
                        font-size: 24px;
                    }
                    
                    .video-controls-bar {
                        padding: 12px;
                        gap: 8px;
                    }
                    
                    .control-btn {
                        width: 32px;
                        height: 32px;
                    }
                    
                    .volume-wrapper {
                        display: none;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.video) return;
        
        // 视频事件
        this.video.addEventListener('loadstart', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('playing', () => this.hideLoading());
        this.video.addEventListener('error', () => this.showError());
        
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('ended', () => this.onEnded());
        
        // 播放控制
        const playOverlay = this.container.querySelector('#playOverlay');
        const playBtn = this.container.querySelector('#playBtn');
        
        playOverlay?.addEventListener('click', () => this.togglePlay());
        playBtn?.addEventListener('click', () => this.togglePlay());
        
        // 进度条
        const progressBar = this.container.querySelector('#progressBar');
        progressBar?.addEventListener('click', (e) => this.seek(e));
        
        // 音量
        const volumeBtn = this.container.querySelector('#volumeBtn');
        const volumeSlider = this.container.querySelector('#volumeSlider');
        
        volumeBtn?.addEventListener('click', () => this.toggleMute());
        volumeSlider?.addEventListener('click', (e) => this.setVolume(e));
        
        // 全屏
        const fullscreenBtn = this.container.querySelector('#fullscreenBtn');
        fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.container.contains(document.activeElement)) return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    this.seekRelative(-5);
                    break;
                case 'ArrowRight':
                    this.seekRelative(5);
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'm':
                    this.toggleMute();
                    break;
            }
        });
    }
    
    /**
     * 切换播放/暂停
     */
    togglePlay() {
        if (!this.video) return;
        
        if (this.video.paused) {
            this.video.play();
            this.isPlaying = true;
        } else {
            this.video.pause();
            this.isPlaying = false;
        }
        
        this.updatePlayButton();
    }
    
    /**
     * 更新播放按钮状态
     */
    updatePlayButton() {
        const playOverlay = this.container.querySelector('#playOverlay');
        const playBtn = this.container.querySelector('#playBtn');
        
        if (this.isPlaying) {
            playOverlay?.classList.add('hidden');
            if (playBtn) playBtn.innerHTML = '❚❚';
        } else {
            playOverlay?.classList.remove('hidden');
            if (playBtn) playBtn.innerHTML = '▶';
        }
    }
    
    /**
     * 更新进度
     */
    updateProgress() {
        if (!this.video) return;
        
        const progress = (this.video.currentTime / this.video.duration) * 100;
        const progressFill = this.container.querySelector('#progressFill');
        const progressHandle = this.container.querySelector('#progressHandle');
        const currentTimeEl = this.container.querySelector('#currentTime');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressHandle) progressHandle.style.left = `${progress}%`;
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.video.currentTime);
    }
    
    /**
     * 更新总时长
     */
    updateDuration() {
        if (!this.video) return;
        
        const durationEl = this.container.querySelector('#duration');
        if (durationEl) durationEl.textContent = this.formatTime(this.video.duration);
    }
    
    /**
     * 跳转到指定位置
     */
    seek(e) {
        if (!this.video) return;
        
        const progressBar = this.container.querySelector('#progressBar');
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        this.video.currentTime = percent * this.video.duration;
    }
    
    /**
     * 相对跳转
     */
    seekRelative(seconds) {
        if (!this.video) return;
        this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
    }
    
    /**
     * 设置音量
     */
    setVolume(e) {
        if (!this.video) return;
        
        const volumeSlider = this.container.querySelector('#volumeSlider');
        const rect = volumeSlider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        this.video.volume = Math.max(0, Math.min(1, percent));
        this.updateVolumeUI();
    }
    
    /**
     * 切换静音
     */
    toggleMute() {
        if (!this.video) return;
        
        this.video.muted = !this.video.muted;
        this.updateVolumeUI();
    }
    
    /**
     * 更新音量UI
     */
    updateVolumeUI() {
        if (!this.video) return;
        
        const volumeBtn = this.container.querySelector('#volumeBtn');
        const volumeFill = this.container.querySelector('#volumeFill');
        
        if (this.video.muted) {
            if (volumeBtn) volumeBtn.innerHTML = '🔇';
            if (volumeFill) volumeFill.style.width = '0%';
        } else {
            const percent = this.video.volume * 100;
            if (volumeFill) volumeFill.style.width = `${percent}%`;
            
            if (volumeBtn) {
                if (percent === 0) volumeBtn.innerHTML = '🔇';
                else if (percent < 50) volumeBtn.innerHTML = '🔉';
                else volumeBtn.innerHTML = '🔊';
            }
        }
    }
    
    /**
     * 切换全屏
     */
    toggleFullscreen() {
        const wrapper = this.container.querySelector('.video-player-wrapper');
        
        if (!document.fullscreenElement) {
            wrapper?.requestFullscreen?.() || wrapper?.webkitRequestFullscreen?.();
            this.isFullscreen = true;
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
            this.isFullscreen = false;
        }
    }
    
    /**
     * 显示加载动画
     */
    showLoading() {
        const loading = this.container.querySelector('#videoLoading');
        loading?.classList.remove('hidden');
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        const loading = this.container.querySelector('#videoLoading');
        loading?.classList.add('hidden');
    }
    
    /**
     * 显示错误
     */
    showError() {
        this.hideLoading();
        const error = this.container.querySelector('#videoError');
        if (error) error.style.display = 'flex';
    }
    
    /**
     * 隐藏错误
     */
    hideError() {
        const error = this.container.querySelector('#videoError');
        if (error) error.style.display = 'none';
    }
    
    /**
     * 重新加载
     */
    reload() {
        this.hideError();
        if (this.video) {
            this.video.load();
            this.showLoading();
        }
    }
    
    /**
     * 播放结束
     */
    onEnded() {
        this.isPlaying = false;
        this.updatePlayButton();
    }
    
    /**
     * 格式化时间
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 加载新视频
     */
    load(src, poster = '') {
        if (!this.video) return;
        
        this.video.src = src;
        if (poster) this.video.poster = poster;
        this.video.load();
        this.isPlaying = false;
        this.updatePlayButton();
        this.showLoading();
    }
    
    /**
     * 销毁播放器
     */
    destroy() {
        if (this.video) {
            this.video.pause();
            this.video.src = '';
        }
        this.container.innerHTML = '';
    }
}

// 全局实例存储
const videoPlayers = {};

/**
 * 创建视频播放器
 */
function createVideoPlayer(containerId, options) {
    videoPlayers[containerId] = new VideoPlayer(containerId, options);
    return videoPlayers[containerId];
}

/**
 * 获取视频播放器实例
 */
function getVideoPlayer(containerId) {
    return videoPlayers[containerId];
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VideoPlayer, createVideoPlayer, getVideoPlayer };
}
