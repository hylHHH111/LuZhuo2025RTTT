// 背景音乐播放器
(function() {
    // 防止重复初始化
    if (window.bgMusicInitialized) {
        return;
    }
    window.bgMusicInitialized = true;
    
    // 创建音频元素
    var bgMusic = document.createElement('audio');
    bgMusic.id = 'bg-music';
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    bgMusic.src = 'music/kanong.mp3';
    bgMusic.volume = 0.5;
    document.body.appendChild(bgMusic);
    window.bgMusic = bgMusic;
    
    // 状态变量
    window.bgMusicPlaying = false;
    window.bgMusicPausedByVideo = false;
    window.bgMusicUserPaused = false;
    
    // 创建音乐控制按钮
    function createMusicButton() {
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
            toggleMusic();
        });
        
        document.body.appendChild(btn);
        updateButtonState();
    }
    
    // 更新按钮状态
    function updateButtonState() {
        var btn = document.getElementById('music-control-btn');
        if (!btn) return;
        
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) {
            btn.innerHTML = '♫';
            btn.style.background = 'rgba(150,150,150,0.9)';
        } else {
            btn.innerHTML = '♪';
            btn.style.background = '#42abf3';
        }
    }
    
    // 切换播放/暂停
    function toggleMusic() {
        if (window.bgMusicPlaying) {
            window.bgMusicUserPaused = true;
            bgMusic.pause();
            window.bgMusicPlaying = false;
        } else {
            window.bgMusicUserPaused = false;
            window.bgMusicPausedByVideo = false;
            bgMusic.play();
            window.bgMusicPlaying = true;
        }
        updateButtonState();
    }
    
    // 尝试播放
    function tryPlay() {
        if (window.bgMusicUserPaused) return;
        bgMusic.play().then(function() {
            window.bgMusicPlaying = true;
            updateButtonState();
        }).catch(function() {});
    }
    
    // 初始化
    createMusicButton();
    tryPlay();
    
    // 用户首次交互后播放
    function onFirstInteraction() {
        tryPlay();
        document.removeEventListener('click', onFirstInteraction);
        document.removeEventListener('touchstart', onFirstInteraction);
    }
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
    
    // 视频点击 - 暂停音乐
    document.addEventListener('click', function(e) {
        var target = e.target;
        var isVideo = target.tagName === 'VIDEO' || target.closest('video') || 
                      target.closest('.video-card') || target.closest('.video-play-btn');
        if (isVideo) {
            window.bgMusicPausedByVideo = true;
            bgMusic.pause();
            window.bgMusicPlaying = false;
            updateButtonState();
        }
    });
    
    // 视频关闭 - 恢复音乐
    document.addEventListener('click', function(e) {
        var target = e.target;
        var isClose = target.classList.contains('close-btn') || 
                      target.classList.contains('modal-close') ||
                      target.closest('.close-btn') || target.closest('.modal-close');
        if (isClose && !window.bgMusicUserPaused) {
            window.bgMusicPausedByVideo = false;
            tryPlay();
            updateButtonState();
        }
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !window.bgMusicUserPaused) {
            window.bgMusicPausedByVideo = false;
            tryPlay();
            updateButtonState();
        }
    });
    
    // 监听音频播放/暂停事件
    bgMusic.addEventListener('play', function() {
        window.bgMusicPlaying = true;
        updateButtonState();
    });
    
    bgMusic.addEventListener('pause', function() {
        // 如果不是用户暂停也不是视频暂停，尝试恢复
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            tryPlay();
        }
        window.bgMusicPlaying = false;
        updateButtonState();
    });
    
})();
