// ============================================
// 鹭卓2025RTTT巡演记录网站 - 数据文件
// ============================================

// 巡演基本信息
const tourInfo = {
  name: '鹭卓2025RTTT巡演',
  fullName: '鹭卓2025「RTTT」全国巡回演唱会',
  theme: 'Run To The Top',
  description: '鹭卓2025「RTTT」全国巡回演唱会，以"Run To The Top"为主题，寓意着不断奔跑、勇攀高峰的音乐之旅。本次巡演将走过成都、合肥、太原、北京、南京五座城市，为歌迷带来震撼的视听盛宴。',
  poster: 'images/banner.jpg'
};

// 城市数据
const citiesData = {
  chengdu: {
    id: 'chengdu',
    name: '成都',
    date: '2025-04-12',
    weekday: '周六',
    venue: '成都凤凰山体育公园',
    address: '成都市金牛区北星大道一段',
    status: 'upcoming', // upcoming, ongoing, completed
    description: '成都站作为本次巡演的首站，将在成都凤凰山体育公园震撼开唱。这座现代化的体育场馆拥有顶级的音响设备和舞台设施，将为歌迷带来极致的视听体验。',
    ticketInfo: {
      price: ['¥380', '¥580', '¥780', '¥980', '¥1280'],
      saleStatus: '即将开售',
      platforms: ['大麦', '猫眼', '票星球']
    },
    images: [
      { url: 'images/cities/chengdu/venue.jpg', caption: '场馆外观' },
      { url: 'images/cities/chengdu/stage.jpg', caption: '舞台效果图' },
      { url: 'images/cities/chengdu/seat.jpg', caption: '座位图' }
    ],
    highlights: [
      '首站演出，全新舞台设计',
      '特别嘉宾助阵',
      '限定周边首发'
    ]
  },
  hefei: {
    id: 'hefei',
    name: '合肥',
    date: '2025-05-17',
    weekday: '周六',
    venue: '合肥滨湖国际会展中心',
    address: '合肥市包河区锦绣大道',
    status: 'upcoming',
    description: '合肥站将在滨湖国际会展中心举行，这座现代化的会展场馆将为演唱会提供完美的场地支持。',
    ticketInfo: {
      price: ['¥380', '¥580', '¥780', '¥980', '¥1280'],
      saleStatus: '即将开售',
      platforms: ['大麦', '猫眼', '票星球']
    },
    images: [
      { url: 'images/cities/hefei/venue.jpg', caption: '场馆外观' },
      { url: 'images/cities/hefei/stage.jpg', caption: '舞台效果图' }
    ],
    highlights: [
      '华东地区重要一站',
      '全新歌单编排'
    ]
  },
  taiyuan: {
    id: 'taiyuan',
    name: '太原',
    date: '2025-06-14',
    weekday: '周六',
    venue: '山西体育中心体育馆',
    address: '太原市晋源区健康南街',
    status: 'upcoming',
    description: '太原站将在山西体育中心体育馆举行，这座现代化的体育馆将为歌迷带来沉浸式的音乐体验。',
    ticketInfo: {
      price: ['¥380', '¥580', '¥780', '¥980', '¥1280'],
      saleStatus: '即将开售',
      platforms: ['大麦', '猫眼', '票星球']
    },
    images: [
      { url: 'images/cities/taiyuan/venue.jpg', caption: '场馆外观' },
      { url: 'images/cities/taiyuan/stage.jpg', caption: '舞台效果图' }
    ],
    highlights: [
      '华北地区唯一一站',
      '特别舞台设计'
    ]
  },
  beijing: {
    id: 'beijing',
    name: '北京',
    date: '2025-07-19',
    weekday: '周六',
    venue: '国家体育馆',
    address: '北京市朝阳区天辰东路',
    status: 'upcoming',
    description: '北京站将在国家体育馆举行，作为巡演的重磅一站，将呈现最完整的舞台效果和演出内容。',
    ticketInfo: {
      price: ['¥380', '¥580', '¥780', '¥980', '¥1280', '¥1680'],
      saleStatus: '即将开售',
      platforms: ['大麦', '猫眼', '票星球']
    },
    images: [
      { url: 'images/cities/beijing/venue.jpg', caption: '场馆外观' },
      { url: 'images/cities/beijing/stage.jpg', caption: '舞台效果图' }
    ],
    highlights: [
      '首都重磅一站',
      '完整版舞台呈现',
      '特别安可环节'
    ]
  },
  nanjing: {
    id: 'nanjing',
    name: '南京',
    date: '2025-08-16',
    weekday: '周六',
    venue: '南京青奥体育公园体育馆',
    address: '南京市浦口区城南河路',
    status: 'upcoming',
    description: '南京站作为巡演的收官之站，将在南京青奥体育公园体育馆为本次巡演画上完美的句号。',
    ticketInfo: {
      price: ['¥380', '¥580', '¥780', '¥980', '¥1280'],
      saleStatus: '即将开售',
      platforms: ['大麦', '猫眼', '票星球']
    },
    images: [
      { url: 'images/cities/nanjing/venue.jpg', caption: '场馆外观' },
      { url: 'images/cities/nanjing/stage.jpg', caption: '舞台效果图' }
    ],
    highlights: [
      '巡演收官之站',
      '特别惊喜环节',
      '限定纪念品'
    ]
  }
};

// 城市顺序（用于首页展示）
const citiesOrder = ['chengdu', 'hefei', 'taiyuan', 'beijing', 'nanjing'];

// 舞台直拍数据
const stageData = {
  songs: [
    {
      id: 'opening',
      name: '开场秀',
      performances: [
        { city: 'chengdu', videoId: 'chengdu-opening', thumbnail: 'images/stage/opening-chengdu.jpg' },
        { city: 'beijing', videoId: 'beijing-opening', thumbnail: 'images/stage/opening-beijing.jpg' }
      ]
    },
    {
      id: 'song1',
      name: '主题曲',
      performances: [
        { city: 'chengdu', videoId: 'chengdu-song1', thumbnail: 'images/stage/song1-chengdu.jpg' },
        { city: 'hefei', videoId: 'hefei-song1', thumbnail: 'images/stage/song1-hefei.jpg' },
        { city: 'beijing', videoId: 'beijing-song1', thumbnail: 'images/stage/song1-beijing.jpg' }
      ]
    },
    {
      id: 'song2',
      name: '热门单曲',
      performances: [
        { city: 'chengdu', videoId: 'chengdu-song2', thumbnail: 'images/stage/song2-chengdu.jpg' },
        { city: 'taiyuan', videoId: 'taiyuan-song2', thumbnail: 'images/stage/song2-taiyuan.jpg' },
        { city: 'nanjing', videoId: 'nanjing-song2', thumbnail: 'images/stage/song2-nanjing.jpg' }
      ]
    },
    {
      id: 'ballad',
      name: '抒情慢歌',
      performances: [
        { city: 'hefei', videoId: 'hefei-ballad', thumbnail: 'images/stage/ballad-hefei.jpg' },
        { city: 'beijing', videoId: 'beijing-ballad', thumbnail: 'images/stage/ballad-beijing.jpg' }
      ]
    },
    {
      id: 'dance',
      name: '舞曲串烧',
      performances: [
        { city: 'chengdu', videoId: 'chengdu-dance', thumbnail: 'images/stage/dance-chengdu.jpg' },
        { city: 'nanjing', videoId: 'nanjing-dance', thumbnail: 'images/stage/dance-nanjing.jpg' }
      ]
    },
    {
      id: 'encore',
      name: '安可曲',
      performances: [
        { city: 'beijing', videoId: 'beijing-encore', thumbnail: 'images/stage/encore-beijing.jpg' },
        { city: 'nanjing', videoId: 'nanjing-encore', thumbnail: 'images/stage/encore-nanjing.jpg' }
      ]
    }
  ]
};

// 导航数据
const navData = [
  { id: 'home', name: '首页', url: '?page=home' },
  { id: 'city', name: '巡演站点', url: '?page=city&city=chengdu' },
  { id: 'stage', name: '舞台直拍', url: '?page=stage' }
];

// 工具函数：获取城市列表
function getCitiesList() {
  return citiesOrder.map(id => citiesData[id]);
}

// 工具函数：获取城市详情
function getCityById(cityId) {
  return citiesData[cityId] || null;
}

// 工具函数：格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

// 工具函数：计算倒计时
function getCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

// 导出数据（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tourInfo,
    citiesData,
    citiesOrder,
    stageData,
    navData,
    getCitiesList,
    getCityById,
    formatDate,
    getCountdown
  };
}
