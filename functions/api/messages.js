// Cloudflare Pages Function - 留言板 API
// 路径: /functions/api/messages.js
// 访问地址: /api/messages

// 敏感词列表
const SENSITIVE_WORDS = [
  '傻逼', '傻B', 'sb', 'SB', '妈的', '他妈', '草泥马', '操', '垃圾', '去死',
  '滚', '贱', '蠢', '笨', '丑', '恶心', '废物', '脑残', '神经病', '变态',
  '诈骗', '骗子', '赌博', '毒品', '色情', '暴力', '恐怖', '邪教', '反动','沅','卓沅','2699','沅儿','劳尔','抄袭'
];

// 管理员密钥
const ADMIN_KEY = 'luzhou20251835172hhll';

// 最大留言数量
const MAX_MESSAGES = 222;

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 获取所有留言
    if (request.method === 'GET') {
      return await getMessages(env);
    }

    // 发布留言
    if (request.method === 'POST') {
      return await postMessage(request, env);
    }

    // 删除留言
    if (request.method === 'DELETE') {
      return await deleteMessage(request, env);
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 获取所有留言
async function getMessages(env) {
  const messages = await env.GUESTBOOK.get('messages', 'json') || [];
  return new Response(JSON.stringify({ success: true, messages }), {
    headers: corsHeaders
  });
}

// 发布留言
async function postMessage(request, env) {
  const data = await request.json();
  const { nickname, content } = data;

  // 验证内容
  if (!content || content.trim().length === 0) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '留言内容不能为空' 
    }), { headers: corsHeaders });
  }

  if (content.length > 500) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '留言内容不能超过500字' 
    }), { headers: corsHeaders });
  }

  // 检查敏感词
  const checkText = (nickname || '') + content;
  for (const word of SENSITIVE_WORDS) {
    if (checkText.toLowerCase().includes(word.toLowerCase())) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '您的留言包含敏感词，请重新输入' 
      }), { headers: corsHeaders });
    }
  }

  // 获取现有留言
  let messages = await env.GUESTBOOK.get('messages', 'json') || [];

  // 创建新留言
  const newMessage = {
    id: Date.now().toString(),
    nickname: nickname && nickname.trim() ? nickname.trim().substring(0, 10) : '匿名用户',
    content: content.trim(),
    timestamp: new Date().toISOString()
  };

  // 新留言添加到开头
  messages.unshift(newMessage);

  // 限制数量，超过则删除旧的
  if (messages.length > MAX_MESSAGES) {
    messages = messages.slice(0, MAX_MESSAGES);
  }

  // 保存到 KV
  await env.GUESTBOOK.put('messages', JSON.stringify(messages));

  return new Response(JSON.stringify({ 
    success: true, 
    message: newMessage 
  }), { headers: corsHeaders });
}

// 删除留言
async function deleteMessage(request, env) {
  const data = await request.json();
  const { id, adminKey } = data;

  // 验证管理员密钥
  if (adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '管理密钥错误' 
    }), { headers: corsHeaders });
  }

  // 获取现有留言
  let messages = await env.GUESTBOOK.get('messages', 'json') || [];

  // 过滤掉要删除的留言
  const originalLength = messages.length;
  messages = messages.filter(msg => msg.id !== id);

  if (messages.length === originalLength) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '留言不存在' 
    }), { headers: corsHeaders });
  }

  // 保存到 KV
  await env.GUESTBOOK.put('messages', JSON.stringify(messages));

  return new Response(JSON.stringify({ 
    success: true, 
    message: '删除成功' 
  }), { headers: corsHeaders });
}
