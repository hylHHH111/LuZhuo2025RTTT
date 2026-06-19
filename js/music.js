// 背景音乐管理器 - 完全由我们控制状态
(function() {
    // 防止重复初始化
    if (window.bgMusicInitialized) {
        return;
    }
    window.bgMusicInitialized = true;
    
    // 音频元素
    var audioElement = null;
    
    // 我们的逻辑控制的状态 - 这三个变量决定了按钮状态
    window.bgMusicPlaying = false;
    window.bgMusicPausedByVideo = false;
    window.bgMusicUserPaused = false;
    
    // 保存播放状态
    function saveMusicState() {
        try {
            localStorage.setItem('bgMusic_userPaused', window.bgMusicUserPaused);
        } catch (e) {}
    }
    
    // 恢复播放状态
    function restoreMusicState() {
        try {
            window.bgMusicUserPaused = localStorage.getItem('bgMusic_userPaused') === 'true';
        } catch (e) {
            window.bgMusicUserPaused = false;
        }
    }
    
    // 更新音乐按钮状态 - 完全由我们的逻辑决定
    function updateMusicButtonState() {
        var btn = document.getElementById('music-control-btn');
        if (!btn) return;
        
        // 只有用户暂停或视频暂停时才显示灰色
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            btn.innerHTML = '♫';
            btn.style.background = 'rgba(150,150,150,0.9)';
            btn.setAttribute('data-playing', 'false');
        } else {
            btn.innerHTML = '♪';
            btn.style.background = '#42abf3';
            btn.setAttribute('data-playing', 'true');
        }
    }
    
    // 播放音乐
    function playMusic() {
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            return;
        }
        
        var playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                window.bgMusicPlaying = true;
            }).catch(function(error) {
                console.log('播放失败:', error);
            });
        }
    }
    
    // 暂停音乐
    function pauseMusic() {
        audioElement.pause();
        window.bgMusicPlaying = false;
    }
    
    // 切换播放/暂停
    window.toggleBgMusic = function() {
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            // 当前暂停，开始播放
            window.bgMusicUserPaused = false;
            window.bgMusicPausedByVideo = false;
            playMusic();
        } else {
            // 当前播放，暂停
            window.bgMusicUserPaused = true;
            pauseMusic();
        }
        updateMusicButtonState();
        saveMusicState();
    };
    
    // 全局函数：暂停背景音乐（由页面调用）
    window.pauseBgMusic = function() {
        window.bgMusicPausedByVideo = true;
        pauseMusic();
        updateMusicButtonState();
    };
    
    // 全局函数：恢复背景音乐（由页面调用）
    window.resumeBgMusic = function() {
        if (!window.bgMusicUserPaused) {
            window.bgMusicPausedByVideo = false;
            playMusic();
            updateMusicButtonState();
        }
    };
    
    // 创建音乐控制按钮
    function createMusicButton() {
        var existingBtn = document.getElementById('music-control-btn');
        if (existingBtn) return;
        
        var btn = document.createElement('div');
        btn.id = 'music-control-btn';
        btn.innerHTML = '♪';
        btn.style.cssText = 'position:fixed;bottom:30px;right:20px;width:36px;height:36px;border-radius:50%;background:#42abf3;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.3);transition:all 0.3s ease;user-select:none;';
        
        btn.addEventListener('mouseenter', function() {
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            window.toggleBgMusic();
        });
        
        document.body.appendChild(btn);
    }
    
    // 初始化
    function init() {
        // 创建音频元素
        audioElement = document.getElementById('bg-music');
        if (!audioElement) {
            audioElement = document.createElement('audio');
            audioElement.id = 'bg-music';
            audioElement.loop = true;
            audioElement.preload = 'auto';
            audioElement.src = 'music/kanong.mp3';
            audioElement.volume = 0.5;
            document.body.appendChild(audioElement);
        }
        
        // 设置全局引用
        window.bgMusic = audioElement;
        
        // 恢复用户暂停状态
        restoreMusicState();
        
        // 创建按钮
        createMusicButton();
        
        // 如果没有用户暂停，则尝试播放
        if (!window.bgMusicUserPaused) {
            playMusic();
        }
        
        updateMusicButtonState();
    }
    
    // 立即初始化
    init();
    
    // 用户交互后尝试播放（Safari 需要用户交互才能自动播放）
    function onUserInteraction() {
        if (!window.bgMusicPlaying && !window.bgMusicUserPaused) {
            playMusic();
        }
        document.removeEventListener('click', onUserInteraction);
        document.removeEventListener('touchstart', onUserInteraction);
    }
    document.addEventListener('click', onUserInteraction);
    document.addEventListener('touchstart', onUserInteraction);
    
    // 监听视频点击 - 暂停音乐
    document.addEventListener('click', function(e) {
        var target = e.target;
        var videoElement = target.tagName === 'VIDEO' ? target : target.closest('video');
        var videoContainer = target.closest('.video-card, [data-video], .video-item, .video-play-btn, .video-thumbnail, .video-wrapper, .video-grid-item, .video-card-wrapper, .stage-video-card, .video-card-play, [data-video-type]');
        
        if (videoElement || videoContainer) {
            window.bgMusicPausedByVideo = true;
            pauseMusic();
            updateMusicButtonState();
        }
    });
    
    document.addEventListener('touchstart', function(e) {
        var target = e.target;
        var videoElement = target.tagName === 'VIDEO' ? target : target.closest('video');
        var videoContainer = target.closest('.video-card, [data-video], .video-item, .video-play-btn, .video-thumbnail, .video-wrapper, .video-grid-item, .video-card-wrapper, .stage-video-card, .video-card-play, [data-video-type]');
        
        if (videoElement || videoContainer) {
            window.bgMusicPausedByVideo = true;
            pauseMusic();
            updateMusicButtonState();
        }
    }, { passive: true });
    
    // 监听关闭按钮
    document.addEventListener('click', function(e) {
        var target = e.target;
        
        var isCloseBtn = target.classList.contains('close-btn') ||
                         target.classList.contains('video-close') ||
                         target.classList.contains('modal-close') ||
                         target.classList.contains('lightbox-close') ||
                         target.classList.contains('video-modal-close') ||
                         target.getAttribute('data-close') !== null ||
                         target.closest('.close-btn') ||
                         target.closest('.video-close') ||
                         target.closest('.modal-close') ||
                         target.closest('.lightbox-close') ||
                         target.closest('.video-modal-close') ||
                         target.closest('[data-close]');
        
        var isOverlay = target.classList.contains('modal-overlay') ||
                        target.classList.contains('video-overlay') ||
                        target.classList.contains('lightbox') ||
                        target.classList.contains('video-modal-overlay');
        
        if (isCloseBtn || isOverlay) {
            setTimeout(function() {
                if (!window.bgMusicUserPaused) {
                    window.bgMusicPausedByVideo = false;
                    playMusic();
                    updateMusicButtonState();
                }
            }, 100);
            setTimeout(function() {
                if (!window.bgMusicUserPaused) {
                    window.bgMusicPausedByVideo = false;
                    playMusic();
                    updateMusicButtonState();
                }
            }, 300);
        }
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            setTimeout(function() {
                if (!window.bgMusicUserPaused) {
                    window.bgMusicPausedByVideo = false;
                    playMusic();
                    updateMusicButtonState();
                }
            }, 100);
        }
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            window.bgMusicPausedByVideo = false;
            if (!window.bgMusicPlaying && !window.bgMusicUserPaused) {
                playMusic();
                updateMusicButtonState();
            }
        }
    });
    
    // pageshow 事件
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            window.bgMusicPausedByVideo = false;
            if (!window.bgMusicUserPaused) {
                playMusic();
                updateMusicButtonState();
            }
        }
    });
    
    // 监听音频暂停事件 - 尝试恢复
    audioElement.addEventListener('pause', function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            playMusic();
        }
    });
    
    // 定期更新按钮状态
    setInterval(function() {
        updateMusicButtonState();
    }, 500);
    
    // 轮询恢复音乐播放（处理移动端滚动自动暂停）
    setInterval(function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo && audioElement.paused) {
            audioElement.play().then(function() {
                window.bgMusicPlaying = true;
            }).catch(function() {});
        }
    }, 200); // 每200ms检查一次
    
})();
