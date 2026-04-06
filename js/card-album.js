/**
 * 卡册式交互组件 - Card Album Component
 * 用于城市页面的三层级卡册交互
 */

class CardAlbum {
    constructor(options = {}) {
        this.options = {
            modalId: 'cardModal',
            viewerId: 'imageViewer',
            ...options
        };
        
        this.modal = null;
        this.viewer = null;
        this.currentLevel = 0;
        this.levelData = [];
        this.history = [];
        this.currentImages = [];
        this.currentImageIndex = 0;
        
        this.init();
    }
    
    /**
     * 初始化组件
     */
    init() {
        this.createModal();
        this.createImageViewer();
        this.bindEvents();
    }
    
    /**
     * 创建弹窗DOM
     */
    createModal() {
        if (document.getElementById(this.options.modalId)) return;
        
        const modalHTML = `
            <div class="modal-overlay" id="${this.options.modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <button class="modal-back" id="modalBack">←</button>
                        <h3 class="modal-title" id="modalTitle">标题</h3>
                        <button class="modal-close" id="modalClose">×</button>
                    </div>
                    <div class="modal-body" id="modalBody">
                        <div class="modal-grid" id="modalGrid"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById(this.options.modalId);
    }
    
    /**
     * 创建图片查看器DOM
     */
    createImageViewer() {
        if (document.getElementById(this.options.viewerId)) return;
        
        const viewerHTML = `
            <div class="image-viewer" id="${this.options.viewerId}">
                <button class="viewer-close" id="viewerClose">×</button>
                <button class="viewer-nav viewer-prev" id="viewerPrev">‹</button>
                <div class="viewer-image-container" id="viewerImageContainer">
                    <img class="viewer-image" id="viewerImage" src="" alt="">
                </div>
                <button class="viewer-nav viewer-next" id="viewerNext">›</button>
                <div class="viewer-toolbar">
                    <button class="viewer-btn viewer-zoom-out" id="viewerZoomOut" title="缩小">−</button>
                    <button class="viewer-btn viewer-zoom-in" id="viewerZoomIn" title="放大">+</button>
                    <div class="viewer-counter" id="viewerCounter">1 / 1</div>
                    <button class="viewer-btn viewer-download" id="viewerDownload" title="下载">⬇</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', viewerHTML);
        this.viewer = document.getElementById(this.options.viewerId);
        this.currentZoom = 1;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 弹窗关闭
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // 返回按钮
        document.getElementById('modalBack')?.addEventListener('click', () => this.goBack());
        
        // 图片查看器
        document.getElementById('viewerClose')?.addEventListener('click', () => this.closeViewer());
        document.getElementById('viewerPrev')?.addEventListener('click', () => this.prevImage());
        document.getElementById('viewerNext')?.addEventListener('click', () => this.nextImage());
        
        // 放大/缩小按钮
        document.getElementById('viewerZoomIn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('viewerZoomOut')?.addEventListener('click', () => this.zoomOut());
        
        // 下载按钮
        document.getElementById('viewerDownload')?.addEventListener('click', () => this.downloadImage());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.viewer?.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeViewer();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
        
        // 触摸滑动事件
        this.bindTouchEvents();
    }
    
    /**
     * 绑定触摸滑动事件
     */
    bindTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50; // 最小滑动距离
        
        const viewerImageContainer = document.getElementById('viewerImageContainer');
        if (!viewerImageContainer) return;
        
        viewerImageContainer.addEventListener('touchstart', (e) => {
            if (!this.viewer?.classList.contains('active')) return;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        viewerImageContainer.addEventListener('touchend', (e) => {
            if (!this.viewer?.classList.contains('active')) return;
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX, minSwipeDistance);
        }, { passive: true });
    }
    
    /**
     * 处理滑动
     */
    handleSwipe(startX, endX, minDistance) {
        const swipeDistance = endX - startX;
        
        if (Math.abs(swipeDistance) < minDistance) return;
        
        if (swipeDistance > 0) {
            // 向右滑动 - 上一张
            this.prevImage();
        } else {
            // 向左滑动 - 下一张
            this.nextImage();
        }
    }
    
    /**
     * 打开弹窗
     * @param {string} title - 弹窗标题
     * @param {Array} data - 卡片数据
     * @param {number} level - 当前层级
     */
    openModal(title, data, level = 0) {
        this.currentLevel = level;
        this.levelData[level] = { title, data };
        
        if (level === 0) {
            this.history = [];
        } else {
            this.history.push(level - 1);
        }
        
        this.renderModal(title, data, level);
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 渲染弹窗内容
     */
    renderModal(title, data, level) {
        const titleEl = document.getElementById('modalTitle');
        const gridEl = document.getElementById('modalGrid');
        const backBtn = document.getElementById('modalBack');
        
        if (titleEl) titleEl.textContent = title;
        if (backBtn) {
            backBtn.classList.toggle('hidden', level === 0);
        }
        
        if (!gridEl) return;
        
        gridEl.innerHTML = data.map((item, index) => {
            const isLastLevel = level >= 2 || item.isLeaf;
            
            if (isLastLevel && item.type === 'video') {
                // 视频卡片
                const isXiaohongshu = item.videoUrl.includes('xiaohongshu.com');
                const clickAction = isXiaohongshu 
                    ? `window.open('${item.videoUrl}', '_blank')` 
                    : `cardAlbum.playVideo('${item.videoUrl}', '${item.title}')`;
                return `
                    <div class="video-card" onclick="${clickAction}">
                        <div class="video-card-play">▶</div>
                        <div class="video-card-title">${item.title}</div>
                        ${isXiaohongshu ? '<div class="video-card-badge">小红书</div>' : ''}
                    </div>
                `;
            } else if (isLastLevel) {
                // 图片卡片（最后一级）- 官摄区及其子分类不显示标题
                // 检查当前层级链中是否有官摄区
                let isOfficialArea = title === '官摄区';
                if (!isOfficialArea) {
                    // 检查所有父级
                    for (let i = 0; i <= level; i++) {
                        if (this.levelData[i] && this.levelData[i].title === '官摄区') {
                            isOfficialArea = true;
                            break;
                        }
                    }
                }
                return `
                    <div class="modal-card" onclick="cardAlbum.openImageViewer(${level}, ${index})">
                        <img src="${item.image || item.thumb || item.cover}" alt="${item.title}" loading="lazy">
                        ${!isOfficialArea ? `<div class="modal-card-title">${item.title}</div>` : ''}
                    </div>
                `;
            } else {
                // 可展开的卡片
                return `
                    <div class="modal-card" onclick="cardAlbum.openNextLevel(${index})">
                        <img src="${item.cover || item.image}" alt="${item.title}" loading="lazy">
                        <div class="modal-card-title">${item.title}</div>
                    </div>
                `;
            }
        }).join('');
    }
    
    /**
     * 打开下一层级
     */
    openNextLevel(index) {
        const currentData = this.levelData[this.currentLevel].data[index];
        if (!currentData.children) return;
        
        this.openModal(
            currentData.title,
            currentData.children,
            this.currentLevel + 1
        );
    }
    
    /**
     * 返回上一级
     */
    goBack() {
        if (this.history.length === 0) return;
        
        const prevLevel = this.history.pop();
        const prevData = this.levelData[prevLevel];
        
        this.currentLevel = prevLevel;
        this.renderModal(prevData.title, prevData.data, prevLevel);
    }
    
    /**
     * 关闭弹窗
     */
    closeModal() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
        this.currentLevel = 0;
        this.history = [];
    }
    
    /**
     * 打开图片查看器
     */
    openImageViewer(level, index) {
        const data = this.levelData[level].data;
        this.currentImages = data.filter(item => item.image || item.thumb);
        this.currentImageIndex = index;
        
        this.showImage();
        this.viewer?.classList.add('active');
    }
    
    /**
     * 显示当前图片
     */
    showImage() {
        const image = this.currentImages[this.currentImageIndex];
        const viewerImg = document.getElementById('viewerImage');
        const counter = document.getElementById('viewerCounter');
        
        if (viewerImg) {
            viewerImg.src = image.image || image.thumb;
            viewerImg.alt = image.title || '';
        }
        
        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1} / ${this.currentImages.length}`;
        }
    }
    
    /**
     * 上一张图片
     */
    prevImage() {
        if (this.currentImages.length <= 1) return;
        this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImages.length) % this.currentImages.length;
        this.showImage();
    }
    
    /**
     * 下一张图片
     */
    nextImage() {
        if (this.currentImages.length <= 1) return;
        this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length;
        this.showImage();
    }
    
    /**
     * 关闭图片查看器
     */
    closeViewer() {
        this.viewer?.classList.remove('active');
        this.resetZoom();
    }
    
    /**
     * 放大图片
     */
    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom + 0.25, 3);
        this.applyZoom();
    }
    
    /**
     * 缩小图片
     */
    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom - 0.25, 0.5);
        this.applyZoom();
    }
    
    /**
     * 重置缩放
     */
    resetZoom() {
        this.currentZoom = 1;
        this.applyZoom();
    }
    
    /**
     * 应用缩放
     */
    applyZoom() {
        const viewerImg = document.getElementById('viewerImage');
        if (viewerImg) {
            viewerImg.style.transform = `scale(${this.currentZoom})`;
            viewerImg.style.transition = 'transform 0.3s ease';
        }
    }
    
    /**
     * 下载当前图片
     */
    downloadImage() {
        const image = this.currentImages[this.currentImageIndex];
        if (!image) return;
        
        const imageUrl = image.image || image.thumb;
        const imageName = image.title || `image_${this.currentImageIndex + 1}`;
        
        // 创建临时链接下载
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${imageName}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * 播放视频
     */
    playVideo(url, title) {
        // 创建视频弹窗
        const videoModal = document.createElement('div');
        videoModal.className = 'modal-overlay active';
        videoModal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body" style="padding: 0;">
                    <div class="video-container" style="aspect-ratio: 16/9;">
                        <video class="video-player" controls autoplay style="width: 100%; height: 100%;">
                            <source src="${url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                    </div>
                </div>
            </div>
        `;
        
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.remove();
            }
        });
        
        document.body.appendChild(videoModal);
    }
    
    /**
     * 打开垂直导航弹窗
     */
    openNavModal(title, images) {
        const navData = images.map((img, i) => {
            let imgTitle;
            if (title === '合照区') {
                // 合照区：前5张为9月26日，后5张为9月27日
                imgTitle = i < 5 ? `9月26日合照 ${i + 1}` : `9月27日合照 ${i - 4}`;
            } else if (title === '海报信封区') {
                // 海报信封区：自定义名称
                const posterTitles = ['手写信信封', '成都站手写信', '主海报', '倒计时3天', '倒计时2天', '倒计时1天'];
                imgTitle = posterTitles[i] || `图片 ${i + 1}`;
            } else if (title === '花束区') {
                // 花束区：图片1和图片2不显示文字
                imgTitle = '';
            } else {
                imgTitle = `图片 ${i + 1}`;
            }
            return {
                title: imgTitle,
                image: img,
                thumb: img,
                isLeaf: true
            };
        });
        
        this.openModal(title, navData, 0);
    }
    
    /**
     * 打开海报花絮弹窗
     */
    openPosterModal(title, images) {
        this.openNavModal(title, images);
    }
    
    /**
     * 打开直拍区弹窗（三层级）
     */
    openFancamModal(cityName, data) {
        this.openModal(`${cityName} - 舞台直拍`, data, 0);
    }
    
    /**
     * 打开图集区弹窗（三层级）
     */
    openGalleryModal(cityName, data) {
        this.openModal(`${cityName} - 精彩图集`, data, 0);
    }
}

/**
 * 城市页面数据管理
 */
class CityDataManager {
    constructor() {
        this.cityData = {};
    }
    
    /**
     * 设置城市数据
     */
    setCityData(cityName, data) {
        this.cityData[cityName] = data;
    }
    
    /**
     * 获取城市数据
     */
    getCityData(cityName) {
        return this.cityData[cityName] || null;
    }
    
    /**
     * 生成直拍区数据模板
     */
    generateFancamData(day1Stages = [], day2Stages = []) {
        const data = [];
        
        if (day1Stages.length > 0) {
            data.push({
                title: 'Day 1',
                cover: 'assets/images/day1-cover.jpg',
                children: day1Stages.map(stage => ({
                    title: stage.name,
                    cover: stage.cover,
                    children: stage.videos.map(video => ({
                        title: video.title,
                        type: 'video',
                        videoUrl: video.url,
                        isLeaf: true
                    }))
                }))
            });
        }
        
        if (day2Stages.length > 0) {
            data.push({
                title: 'Day 2',
                cover: 'assets/images/day2-cover.jpg',
                children: day2Stages.map(stage => ({
                    title: stage.name,
                    cover: stage.cover,
                    children: stage.videos.map(video => ({
                        title: video.title,
                        type: 'video',
                        videoUrl: video.url,
                        isLeaf: true
                    }))
                }))
            });
        }
        
        return data;
    }
    
    /**
     * 生成图集区数据模板
     */
    generateGalleryData(stylingData = [], day1Data = [], day2Data = []) {
        const data = [];
        
        if (stylingData.length > 0) {
            data.push({
                title: '定妆照',
                cover: 'assets/images/styling-cover.jpg',
                children: stylingData.map(style => ({
                    title: style.name,
                    cover: style.cover,
                    children: style.images.map(img => ({
                        title: img.title || '图片',
                        image: img.url,
                        thumb: img.thumb || img.url,
                        isLeaf: true
                    }))
                }))
            });
        }
        
        if (day1Data.length > 0) {
            data.push({
                title: 'Day 1',
                cover: 'assets/images/day1-gallery-cover.jpg',
                children: day1Data.map(style => ({
                    title: style.name,
                    cover: style.cover,
                    children: style.images.map(img => ({
                        title: img.title || '图片',
                        image: img.url,
                        thumb: img.thumb || img.url,
                        isLeaf: true
                    }))
                }))
            });
        }
        
        if (day2Data.length > 0) {
            data.push({
                title: 'Day 2',
                cover: 'assets/images/day2-gallery-cover.jpg',
                children: day2Data.map(style => ({
                    title: style.name,
                    cover: style.cover,
                    children: style.images.map(img => ({
                        title: img.title || '图片',
                        image: img.url,
                        thumb: img.thumb || img.url,
                        isLeaf: true
                    }))
                }))
            });
        }
        
        return data;
    }
}

// 全局实例
const cardAlbum = new CardAlbum();
const cityDataManager = new CityDataManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardAlbum, CityDataManager, cardAlbum, cityDataManager };
}
