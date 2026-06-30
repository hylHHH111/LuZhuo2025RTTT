// 背景音乐播放器 - Web Audio API 版本
// 注意：此脚本只在独立打开页面时生效
// 通过 shell.html 的 iframe 打开时，音频由 shell.html 控制
(function() {
    // 防止重复初始化
    if (window.bgMusicInitialized) return;
    window.bgMusicInitialized = true;
    
    // 如果在 iframe 中运行，完全禁用音频功能（由父页面 shell.html 处理）
    if (window !== window.parent) {
        window.pauseBgMusic = function() {};
        window.resumeBgMusic = function() {};
        return;
    }
    
    // 检查是否已经存在音频元素（防止重复创建）
    var existingAudio = document.getElementById('bg-music');
    if (existingAudio) {
        console.log('已存在音频元素，跳过创建');
        return;
    }
    
    // 检查是否已经由 shell.html 控制音频
    if (window.bgMusicControlledByShell) {
        console.log('音频已由 shell.html 控制，跳过创建');
        return;
    }
    
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
            }).catch(function() {});
        }
    }
    
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
        }
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !window.bgMusicUserPaused) {
            window.bgMusicPausedByVideo = false;
            initWebAudio();
            ensureContextRunning();
            tryPlay();
        }
    });
    
    // 持续轮询恢复播放（关键！用于对抗浏览器自动暂停）
    setInterval(function() {
        if (!window.bgMusicUserPaused && !window.bgMusicPausedByVideo && audioElement.paused) {
            initWebAudio();
            ensureContextRunning();
            audioElement.play().then(function() {
                window.bgMusicPlaying = true;
            }).catch(function() {});
        }
    }, 100); // 每100ms检查一次
    
})();
