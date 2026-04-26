// 背景音乐管理器 - 全站通用
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
        bgMusic.src = 'music/juxianghuaxingyun.MP3';
        bgMusic.volume = 0.5;
        bgMusic.autoplay = true; // 尝试自动播放
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
            localStorage.setItem('bgMusic_currentTime', bgMusic.currentTime);
            localStorage.setItem('bgMusic_isPlaying', window.bgMusicPlaying);
            localStorage.setItem('bgMusic_pausedByVideo', window.bgMusicPausedByVideo);
            localStorage.setItem('bgMusic_userPaused', window.bgMusicUserPaused);
        } catch (e) {}
    }
    
    // 从 localStorage 恢复播放状态
    function restoreMusicState() {
        try {
            var savedTime = localStorage.getItem('bgMusic_currentTime');
            var wasPlaying = localStorage.getItem('bgMusic_isPlaying') === 'true';
            var pausedByVideo = localStorage.getItem('bgMusic_pausedByVideo') === 'true';
            // 首次访问时不考虑用户暂停状态，让音乐能自动播放
            var userPaused = false;
            
            if (savedTime) {
                bgMusic.currentTime = parseFloat(savedTime);
            }
            return { wasPlaying: wasPlaying, pausedByVideo: pausedByVideo, userPaused: userPaused };
        } catch (e) {
            return { wasPlaying: false, pausedByVideo: false, userPaused: false };
        }
    }
    
    // 更新音乐按钮状态
    function updateMusicButtonState() {
        var btn = document.getElementById('music-control-btn');
        if (!btn) return;
        
        if (window.bgMusicPlaying) {
            btn.innerHTML = '♪';
            btn.style.background = '#42abf3';
            btn.setAttribute('data-playing', 'true');
        } else {
            btn.innerHTML = '♫';
            btn.style.background = 'rgba(150,150,150,0.9)';
            btn.setAttribute('data-playing', 'false');
        }
    }
    
    // 切换播放/暂停
    window.toggleBgMusic = function() {
        if (window.bgMusicPlaying) {
            bgMusic.pause();
            window.bgMusicPlaying = false;
            window.bgMusicUserPaused = true;
        } else {
            window.bgMusicUserPaused = false;
            bgMusic.play().then(function() {
                window.bgMusicPlaying = true;
                updateMusicButtonState();
                saveMusicState();
            }).catch(function(error) {
                console.log('播放失败:', error);
            });
        }
        updateMusicButtonState();
        saveMusicState();
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
    
    // 尝试播放
    function tryPlay() {
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            return;
        }
        
        bgMusic.play().then(function() {
            window.bgMusicPlaying = true;
            updateMusicButtonState();
            saveMusicState();
        }).catch(function(error) {
            // 自动播放被阻止
        });
    }
    
    // 初始化音乐
    function initMusic() {
        var state = restoreMusicState();
        
        window.bgMusicUserPaused = state.userPaused;
        
        // 创建音乐控制按钮
        createMusicButton();
        
        // 定期保存播放进度（每1秒）
        setInterval(saveMusicState, 1000);
        
        // 重置视频暂停状态
        window.bgMusicPausedByVideo = false;
        
        // 尝试播放
        tryPlay();
        
        // 更新按钮状态
        updateMusicButtonState();
    }
    
    // 用户首次交互后尝试播放
    function handleUserInteraction(e) {
        if (!window.bgMusicPlaying && !window.bgMusicUserPaused) {
            bgMusic.play().then(function() {
                window.bgMusicPlaying = true;
                updateMusicButtonState();
                saveMusicState();
            }).catch(function(error) {
                // 播放失败，不处理
            });
        }
    }
    
    // 添加点击交互事件监听
    document.addEventListener('click', function(e) {
        // 排除导航栏和汉堡菜单按钮的点击
        if (e.target.closest('.navbar, .navbar-toggle, .navbar-nav, .nav-item')) {
            return;
        }
        handleUserInteraction(e);
    });
    document.addEventListener('touchstart', function(e) {
        // 排除导航栏和汉堡菜单按钮的触摸
        if (e.target.closest('.navbar, .navbar-toggle, .navbar-nav, .nav-item')) {
            return;
        }
        handleUserInteraction(e);
    });
    
    // 立即执行初始化
    initMusic();
    
    // 页面卸载前保存状态
    window.addEventListener('beforeunload', saveMusicState);
    
    // 监听视频点击 - 暂停音乐
    document.addEventListener('click', function(e) {
        var target = e.target;
        var videoElement = target.tagName === 'VIDEO' ? target : target.closest('video');
        var videoContainer = target.closest('.video-card, [data-video], .video-item, .video-play-btn, .video-thumbnail, .video-wrapper, .video-grid-item');
        
        if (videoElement || videoContainer) {
            window.bgMusicPausedByVideo = true;
            saveMusicState();
            if (window.bgMusicPlaying) {
                bgMusic.pause();
                window.bgMusicPlaying = false;
                updateMusicButtonState();
                saveMusicState();
            }
        }
    });
    
    // 恢复音乐函数
    function resumeMusic() {
        window.bgMusicPausedByVideo = false;
        saveMusicState();
        tryPlay();
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
            var state = restoreMusicState();
            window.bgMusicPausedByVideo = false;
            if (state.wasPlaying && !state.userPaused && !window.bgMusicPlaying) {
                tryPlay();
            }
        }
    });
    
    // 使用 pageshow 事件处理页面切换
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            var state = restoreMusicState();
            window.bgMusicPausedByVideo = false;
            if (state.wasPlaying && !state.userPaused) {
                tryPlay();
            }
        }
    });
    
})();
