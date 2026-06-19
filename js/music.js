// 背景音乐播放器 - Web Audio API 版本
(function() {
    // 防止重复初始化
    if (window.bgMusicInitialized) return;
    window.bgMusicInitialized = true;
    
    // 状态变量
    window.bgMusicPlaying = false;
    window.bgMusicPausedByVideo = false;
    window.bgMusicUserPaused = false;
    
    // Web Audio API 相关
    var audioContext = null;
    var audioElement = null;
    var sourceNode = null;
    var gainNode = null;
    var audioStarted = false;
    
    // 创建音频元素
    audioElement = document.createElement('audio');
    audioElement.id = 'bg-music';
    audioElement.loop = true;
    audioElement.preload = 'auto';
    audioElement.src = 'music/kanong.mp3';
    audioElement.volume = 0.5;
    document.body.appendChild(audioElement);
    window.bgMusic = audioElement;
    
    // 初始化 Web Audio API
    function initWebAudio() {
        if (audioStarted) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;
            gainNode.connect(audioContext.destination);
            
            sourceNode = audioContext.createMediaElementSource(audioElement);
            sourceNode.connect(gainNode);
            
            audioStarted = true;
            console.log('Web Audio API 已启用');
        } catch (e) {
            console.log('Web Audio API 不可用:', e);
        }
    }
    
    // 确保 AudioContext 运行
    function ensureContextRunning() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    
    // 创建音乐控制按钮（只在非 iframe 环境中创建）
    function createMusicButton() {
        // 如果在 iframe 中运行，不创建按钮（由父页面 shell.html 提供）
        if (window !== window.parent) {
            return;
        }
        
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
    
    // 更新按钮状态（只在非 iframe 环境中更新）
    function updateButtonState() {
        // 如果在 iframe 中运行，不更新按钮（由父页面 shell.html 管理）
        if (window !== window.parent) {
            return;
        }
        
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
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo) {
            window.bgMusicUserPaused = true;
            audioElement.pause();
            window.bgMusicPlaying = false;
        } else {
            window.bgMusicUserPaused = false;
            window.bgMusicPausedByVideo = false;
            initWebAudio();
            ensureContextRunning();
            audioElement.play();
            window.bgMusicPlaying = true;
        }
        updateButtonState();
    }
    
    // 尝试播放
    function tryPlay() {
        if (window.bgMusicUserPaused || window.bgMusicPausedByVideo) return;
        
        initWebAudio();
        ensureContextRunning();
        
        var promise = audioElement.play();
        if (promise) {
            promise.then(function() {
                window.bgMusicPlaying = true;
                updateButtonState();
            }).catch(function() {});
        }
    }
    
    // 初始化
    createMusicButton();
    
    // 用户首次交互后初始化 Web Audio 和播放
    function onFirstInteraction() {
        initWebAudio();
        ensureContextRunning();
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
            audioElement.pause();
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
            initWebAudio();
            ensureContextRunning();
            tryPlay();
            updateButtonState();
        }
    });
    
    // 持续轮询恢复播放（关键！用于对抗浏览器自动暂停）
    setInterval(function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo && audioElement.paused) {
            initWebAudio();
            ensureContextRunning();
            audioElement.play().then(function() {
                window.bgMusicPlaying = true;
                updateButtonState();
            }).catch(function() {});
        }
    }, 100); // 每100ms检查一次
    
})();
