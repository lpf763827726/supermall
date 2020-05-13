export function debounce(func, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 正则表达式是干什么的？字符串匹配 利器（难，规则太多）
export function formatDate(date, fmt) {
  // 1.获取年份

  // ?表示可有可无，至少一个 -> 0个或者1个
  // *表示可有可无，多了不限 -> 0个或者多个
  // +表示至少一个，多了不限 -> 1个或者多个

  // 2019
  // y    - 9
  // yy   - 19
  // yyy  - 019
  // yyyy - 2019
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  // 2.获取
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

function padLeftZero (str) {
  return ('00' + str).substr(str.length);
};

