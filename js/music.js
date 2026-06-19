// 背景音乐管理器 - 简化版
(function() {
    // 防止重复初始化
    if (window.bgMusicInitialized) {
        return;
    }
    window.bgMusicInitialized = true;
    
    // 获取或创建音频元素
    var bgMusic = document.getElementById('bg-music');
    if (!bgMusic) {
        bgMusic = document.createElement('audio');
        bgMusic.id = 'bg-music';
        bgMusic.loop = true;
        bgMusic.preload = 'auto';
        bgMusic.src = 'music/kanong.mp3';
        bgMusic.volume = 0.5;
        bgMusic.autoplay = true;
        document.body.appendChild(bgMusic);
    }
    
    // 全局变量
    window.bgMusic = bgMusic;
    window.bgMusicPlaying = false;
    window.bgMusicPausedByVideo = false;
    window.bgMusicUserPaused = false;
    
    // 保存播放状态到 localStorage
    function saveMusicState() {
        try {
            localStorage.setItem('bgMusic_isPlaying', window.bgMusicPlaying);
            localStorage.setItem('bgMusic_pausedByVideo', window.bgMusicPausedByVideo);
            localStorage.setItem('bgMusic_userPaused', window.bgMusicUserPaused);
        } catch (e) {}
    }
    
    // 从 localStorage 恢复播放状态
    function restoreMusicState() {
        try {
            var wasPlaying = localStorage.getItem('bgMusic_isPlaying') === 'true';
            var pausedByVideo = localStorage.getItem('bgMusic_pausedByVideo') === 'true';
            var userPaused = false; // 首次访问时不考虑用户暂停状态
            return { wasPlaying: wasPlaying, pausedByVideo: pausedByVideo, userPaused: userPaused };
        } catch (e) {
            return { wasPlaying: false, pausedByVideo: false, userPaused: false };
        }
    }
    
    // 更新音乐按钮状态
    function updateMusicButtonState() {
        var btn = document.getElementById('music-control-btn');
        if (!btn) return;
        
        // 按钮状态由我们的逻辑控制：只有用户暂停或视频暂停时才显示灰色
        // 不管浏览器是否真的在播放
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            btn.innerHTML = '♪';
            btn.style.background = '#42abf3';
            btn.setAttribute('data-playing', 'true');
        } else {
            btn.innerHTML = '♫';
            btn.style.background = 'rgba(150,150,150,0.9)';
            btn.setAttribute('data-playing', 'false');
        }
    }
    
    // 播放音乐
    function playMusic() {
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            return;
        }
        
        bgMusic.play().then(function() {
            window.bgMusicPlaying = true;
            saveMusicState();
        }).catch(function(error) {
            console.log('播放失败:', error);
        });
    }
    
    // 暂停音乐
    function pauseMusic() {
        bgMusic.pause();
        window.bgMusicPlaying = false;
        saveMusicState();
    }
    
    // 切换播放/暂停
    window.toggleBgMusic = function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            // 当前正在播放，暂停
            window.bgMusicUserPaused = true;
            pauseMusic();
        } else {
            // 当前未播放，开始播放
            window.bgMusicUserPaused = false;
            window.bgMusicPausedByVideo = false;
            playMusic();
        }
        updateMusicButtonState();
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
    
    // 初始化音乐
    function initMusic() {
        var state = restoreMusicState();
        window.bgMusicUserPaused = state.userPaused;
        
        createMusicButton();
        saveMusicState();
        
        // 重置视频暂停状态
        window.bgMusicPausedByVideo = false;
        
        // 尝试播放
        if (!window.bgMusicUserPaused) {
            playMusic();
        }
        
        updateMusicButtonState();
    }
    
    // 用户交互后尝试播放
    function handleUserInteraction() {
        if (!window.bgMusicPlaying && !window.bgMusicUserPaused) {
            playMusic();
        }
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.navbar, .navbar-toggle, .navbar-nav, .nav-item')) {
            return;
        }
        handleUserInteraction();
    });
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.navbar, .navbar-toggle, .navbar-nav, .nav-item')) {
            return;
        }
        handleUserInteraction();
    });
    
    // 立即执行初始化
    initMusic();
    
    // 页面卸载前保存状态
    window.addEventListener('beforeunload', saveMusicState);
    
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
    
    // 恢复音乐
    function resumeMusic() {
        if (!window.bgMusicUserPaused) {
            window.bgMusicPausedByVideo = false;
            playMusic();
            updateMusicButtonState();
        }
    }
    
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
            setTimeout(resumeMusic, 100);
            setTimeout(resumeMusic, 300);
        }
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            setTimeout(resumeMusic, 100);
        }
    });
    
    // 页面可见性变化处理
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            window.bgMusicPausedByVideo = false;
            var state = restoreMusicState();
            if (state.wasPlaying && !state.userPaused && !window.bgMusicPlaying) {
                playMusic();
                updateMusicButtonState();
            }
        }
    });
    
    // pageshow 事件处理
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            window.bgMusicPausedByVideo = false;
            var state = restoreMusicState();
            if (state.wasPlaying && !state.userPaused) {
                playMusic();
                updateMusicButtonState();
            }
        }
    });
    
    // 监听音频播放事件 - 更新状态
    bgMusic.addEventListener('play', function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            window.bgMusicPlaying = true;
            updateMusicButtonState();
            saveMusicState();
        }
    });
    
    // 监听音频暂停事件 - 如果不是用户主动暂停，尝试恢复
    bgMusic.addEventListener('pause', function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            // 被意外暂停，尝试恢复
            playMusic();
        }
    });
    
    // 定期更新按钮状态（确保按钮状态正确显示）
    setInterval(function() {
        updateMusicButtonState();
    }, 500);
    
})();
