(() => {
  const LANGUAGE_KEY = "elione-site-language";
  const CACHE_KEY = "elione-site-en-cache-v1";
  const hasChinese = (value) => /[\u3400-\u9fff]/.test(value || "");
  const textOriginals = new Map();
  const attributeOriginals = new Map();
  let currentLanguage = "zh";
  let translatorPromise = null;
  let operationId = 0;
  let saveTimer = 0;

  const manualEnglish = {
    "Elione | 产品经理 / 自由设计师": "Elione | Product Manager / Freelance Designer",
    "沈婕薇": "Shen Jiewei",
    "产品研究思辨": "Product Research",
    "产品研究文章": "Product Research Articles",
    "产品开发": "Product Development",
    "跨境产品开发": "Cross-border Product Development",
    "纺织箱包设计": "Textile & Bag Design",
    "纺织类产品": "Textile Products",
    "平面设计": "Graphic Design",
    "关于我": "About",
    "返回主页": "Back to Home",
    "回到首页": "Back to Home",
    "保持联系": "Stay in Touch",
    "联系我": "Contact Me",
    "目录入口": "Portfolio Directory",
    "项目目录": "Project Directory",
    "技能": "Skills",
    "作品": "Work",
    "产品经理/自由设计师": "Product Manager / Freelance Designer",
    "跨境市场-产品开发": "Cross-border Product Development",
    "电子玩偶品线开发逻辑": "Interactive Toy Line Development",
    "DIY 品线开发逻辑": "DIY Product Line Development",
    "迭代类型项目开发": "Iterative Product Development",
    "DIY 产品开发": "DIY Product Development",
    "AI 智能玩具": "AI Interactive Toys",
    "Lucy / Toby 智能宠物": "Lucy / Toby Smart Pets",
    "电子小狗过家家玩具": "Interactive Puppy Role-play Toy",
    "仙人掌摇铃电子玩具": "Interactive Cactus Rattle Toy",
    "分阶剪纸书套装": "Progressive Paper-cutting Book Kit",
    "EMO社会情绪学习项目": "EMO Social-emotional Learning Project",
    "Poke-In 戳戳游戏套装": "Poke-In Craft Game Kit",
    "时尚布料戳戳套装": "Fashion Fabric Poke-in Kit",
    "幼儿背包设计/开发": "Preschool Backpack Design & Development",
    "护脊类学龄儿童背包设计/开发": "Ergonomic School Backpack Design & Development",
    "东南亚多巴胺系列": "Southeast Asia Dopamine Series",
    "其他周边产品": "Other Accessories",
    "项目背景 / Project Background": "Project Background",
    "项目注释 / Project Notes": "Project Notes",
    "纺织类产品（产品设计/产品开发）": "Textile Products — Design & Development",
    "产品研究思辨文章": "Product Research Essays",
    "这里收录的是我从业以来对产品研究与实践的思考；希望这些文章也能让你进一步了解我的工作方式与思考方向，也欢迎与我交流、讨论。": "This section collects my reflections on product research and practice throughout my career. I hope these articles offer a clearer view of how I work and the directions that shape my thinking, and I welcome conversation and discussion.",
    "产品合作、自由设计与有趣的想法，都欢迎来信。": "I welcome product collaborations, freelance design projects, and interesting ideas.",
    "在产品逻辑与视觉情绪之间": "Between Product Logic and Visual Emotion",
    "进入关于我": "About Me",
    "研究、设计与落地": "Research, Design, and Delivery",
    "查看履历": "View Experience",
    "从系统到具体物件": "From Systems to Real Products",
    "让想法开始发生": "Let Ideas Take Shape",
    "写邮件": "Email Me",
    "联系方式": "Contact",
    "关闭大图": "Close Image",
    "上一张": "Previous",
    "下一张": "Next",
    "关闭视频": "Close Video",
    "产品视频": "Product Video",
    "播放背景音乐": "Play Background Music",
    "暂停背景音乐": "Pause Background Music",
    "点击播放": "Click to Play",
    "我是沈婕薇 Elione，产品经理 / 自由设计师。八年儿童品牌工作经验（2019-2026），深耕纺织品类-儿童背包，文具等项目，熟悉布料及工艺结构以及供应链，近3年为跨境儿童玩具开发品牌工作，持续关注人群消费、市场趋势、展览与现代艺术。": "I am Shen Jiewei (Elione), a product manager and freelance designer with eight years of experience in children's brands (2019–2026). I have worked extensively on textile products—including children's backpacks and stationery—and understand fabrics, manufacturing structures, craftsmanship, and supply chains. For the past three years, I have developed children's toys for cross-border brands while continuing to study consumer behavior, market trends, exhibitions, and modern art.",
    "项目注释：Poke In 是已延续十余年的经典纸艺玩法，本项目不改变“戳入—固定—成型”的核心动作，而是通过新主题、新材料组合与立体化套装结构更新体验。产品从单件平面手作扩展为可陈列的公主裙、城堡舞台与角色场景，并加入皇冠、项链等DIY贴纸装饰，让儿童在熟悉的低门槛玩法中获得更强的造型参与感、完成感与展示价值。": "Project note: Poke In is a classic paper-craft play pattern that has endured for more than a decade. Rather than changing its core poke–secure–shape action, this project refreshes the experience through new themes, material combinations, and three-dimensional kit structures. The product expands from a single flat craft into displayable princess dresses, castle stages, and character scenes, with DIY crown and necklace stickers that give children a stronger sense of participation, completion, and display value within a familiar, low-barrier activity.",
    "项目注释：面向0+低龄儿童的多感官互动需求，将传统唱跳仙人掌升级为“玩偶＋摇铃/沙锤”的组合体验。产品通过音乐播放、语音跟读、摆动唱跳和按键触发形成即时反馈，并把可抓握的沙锤配件融入安抚、节奏感与亲子互动场景；在保留低门槛操作的同时，强化听觉刺激、动作追视与陪伴属性。": "Project note: Designed for the multisensory interaction needs of infants and toddlers, this product upgrades the traditional singing-and-dancing cactus into a combined plush toy and rattle/maraca experience. Music, voice repetition, dancing motion, and button-triggered responses provide immediate feedback, while the graspable maraca supports soothing, rhythm play, and parent–child interaction. The design keeps operation simple while strengthening auditory stimulation, visual tracking, and companionship.",
    "项目注释：围绕儿童情绪识别、陪伴安抚与照护角色扮演开发的互动抱抱熊。产品用四色灯光对应快乐、安抚、平静与生气等情绪状态，孩子可通过按压手掌触发音乐、使用奶瓶触发饮水音效，并在拥抱、喂养和照顾过程中获得即时反馈。开发重点是把情绪表达转化为无需联网、入口简单的多感官互动，让低龄儿童在重复游戏中练习识别情绪、表达感受和建立关怀行为。": "Project note: An interactive comfort bear developed around emotional recognition, soothing companionship, and nurturing role-play. Four light colors represent happy, soothed, calm, and angry emotional states; children can press the paw to play music, use the bottle to trigger drinking sounds, and receive immediate feedback while hugging, feeding, and caring for the bear. The development focus is to turn emotional expression into simple, offline, multisensory interaction so young children can practice recognizing emotions, expressing feelings, and caring behavior through repeated play.",
    "钻石脸贴装扮系列": "Gem Face Decoration Series",
    "贴纸拼图套装": "Sticker Puzzle Kit",
    "毛毡贴双面场景板": "Double-sided Felt Scene Board",
    "项目注释：以“观察形状—寻找对应—补全画面”为核心，把传统贴纸游戏设计成由易到难的四阶段拼图体验。孩子先从角色与物件的直观配对开始，再进入几何形状识别、局部图像判断与圆形贴纸旋转对位，逐步提升精细动作、逻辑推理、手眼协调、视觉辨识与专注力。产品通过公主、恐龙、动物等主题扩展内容，同一套基础操作可覆盖不同年龄与能力阶段，让贴纸从一次性装饰材料转化为具有明确学习路径和重复挑战价值的益智产品。": "Project note: Built around observing shapes, finding matches, and completing pictures, this product turns a traditional sticker activity into a four-stage puzzle experience that progresses from easy to challenging. Children begin with direct character and object matching, then advance to geometric shape recognition, partial-image reasoning, and rotating circular stickers into alignment. The sequence develops fine motor skills, logical reasoning, hand–eye coordination, visual discrimination, and concentration. Princess, dinosaur, and animal themes extend the content while the same core interaction supports multiple ages and ability levels, transforming stickers from one-time decoration into a structured learning product with repeatable challenge value.",
    "项目注释：以柔软布料制作可反复取放的毛毡贴纸，将贴纸书从平面粘贴升级为可触摸、可组合、可重复创作的场景游戏。异形双面板分别承载主题配对与开放式场景搭建，儿童可依据轮廓完成形状对应，也可以自由布置角色、动物和交通工具；服装搭配主题进一步利用毛毡易叠加的特性，实现上衣、裙装、配饰等多层叠穿组合。产品兼顾低门槛操作、触觉体验与开放式表达，并通过公主、动物、恐龙等主题形成可持续扩展的内容系列。": "Project note: Made from soft fabric, these reusable felt stickers upgrade the sticker book from flat pasting into a tactile, combinable scene-building experience. The shaped double-sided boards support both guided theme matching and open-ended scene creation, allowing children to follow outlines or freely arrange characters, animals, and vehicles. Fashion themes make further use of felt's layering quality, enabling tops, skirts, and accessories to be stacked into multiple outfit combinations. The product combines easy operation, tactile play, and open creative expression, with princess, animal, and dinosaur themes forming an expandable content system.",
    "05 / 关于我": "05 / About",
    "我是沈婕薇 Elione，产品经理/自由设计师；MBTI：INTJ喜欢在产品逻辑和视觉情绪之间找到平衡。": "I am Shen Jiewei (Elione), a product manager and freelance designer. MBTI: INTJ. I enjoy finding balance between product logic and visual emotion.",
    "我是沈婕薇 Elione，产品经理/自由设计师；": "I am Shen Jiewei (Elione), a product manager and freelance designer;",
    "MBTI：INTJ": "MBTI: INTJ",
    "喜欢在产品逻辑和视觉情绪之间找到平衡。": "I enjoy finding balance between product logic and visual emotion.",
    "设计专业出身的产品经理，拥有NPDP国际产品经理认证，掌握项目管理和产品开发方法论；并对品牌产品研发有较高审美把控。2019年-2026年，8年时间工作聚焦儿童市场。前5年深耕国内市场细分领域：儿童背包及文具，熟悉产品设计、结构落地、工艺与供应链开发，关注消费者与使用者，在该细分领域具有无可替代的核心竞争力；后3年顺应跨境趋势进入跨境品牌工作，开始跨境市场分析以及研究欧美教育体系下的产品开发。": "A product manager with a professional design background and NPDP certification, I apply established project-management and product-development methods with strong aesthetic judgment. From 2019 to 2026, my work focused on the children's market: five years developing backpacks and stationery for the domestic market, followed by three years in cross-border brands, market analysis, and product development informed by European and American education systems.",
    "无论作为产品经理还是设计师，我的灵感来自生活本身；人群观察研究、展览、城市发展、市场变化，而我们本身也处在变化中。我注重个人的生活方式和情绪，我相信一位有温度的产品开发者，才能开发出有温度、符合用户需求的好产品。": "Whether working as a product manager or designer, I draw inspiration from everyday life: observing people, exhibitions, urban development, and changing markets. I believe thoughtful products that truly meet users' needs begin with an empathetic product developer.",
    "商务电话：17859381562": "Business: 17859381562",
    "微信：Eillioness": "WeChat: Eillioness",
    "玩具市场": "Toy Market",
    "视觉传达": "Visual Communication",
    "数据调研": "Data Research",
    "市场研究": "Market Research",
    "人群研究": "User Research",
    "阅读": "Reading"
  };

  let translationCache = {};
  try {
    translationCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch (_error) {
    translationCache = {};
  }

  const switcher = document.querySelector("[data-language-switcher]");
  const buttons = [...document.querySelectorAll("[data-language-option]")];
  const status = document.querySelector("[data-language-status]");

  const setStatus = (message = "") => {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  };

  const updateControls = (language) => {
    buttons.forEach((button) => {
      const active = button.dataset.languageOption === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const shouldIgnore = (node) => {
    const parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    return !parent || parent.closest("script, style, noscript, template, [data-language-switcher]");
  };

  const rememberTextNode = (node) => {
    if (shouldIgnore(node) || textOriginals.has(node)) return false;
    const source = node.nodeValue;
    if (!hasChinese(source)) return false;
    textOriginals.set(node, source);
    return true;
  };

  const rememberAttributes = (element) => {
    if (!(element instanceof Element) || shouldIgnore(element)) return false;
    const names = ["aria-label", "title", "alt", "placeholder"];
    if (element.matches('meta[name="description"]')) names.push("content");
    let remembered = attributeOriginals.get(element);
    let added = false;
    names.forEach((name) => {
      const value = element.getAttribute(name);
      if (!hasChinese(value)) return;
      if (!remembered) {
        remembered = new Map();
        attributeOriginals.set(element, remembered);
      }
      if (!remembered.has(name)) {
        remembered.set(name, value);
        added = true;
      }
    });
    return added;
  };

  const capture = (root = document.documentElement) => {
    let added = 0;
    if (root.nodeType === Node.TEXT_NODE) added += rememberTextNode(root) ? 1 : 0;
    else if (root instanceof Element) added += rememberAttributes(root) ? 1 : 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) added += rememberTextNode(node) ? 1 : 0;
      else added += rememberAttributes(node) ? 1 : 0;
    }
    return added;
  };

  const withWhitespace = (original, translated) => {
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    return `${leading}${translated}${trailing}`;
  };

  const applyKnownEnglish = () => {
    capture();
    textOriginals.forEach((original, node) => {
      if (!node.isConnected) return;
      const source = original.trim();
      const translated = manualEnglish[source] || translationCache[source];
      if (translated) node.nodeValue = withWhitespace(original, translated);
    });
    attributeOriginals.forEach((attributes, element) => {
      if (!element.isConnected) return;
      attributes.forEach((source, name) => {
        const translated = manualEnglish[source] || translationCache[source];
        if (translated) element.setAttribute(name, translated);
      });
    });
  };

  const applyEnglishSource = (source, translated) => {
    textOriginals.forEach((original, node) => {
      if (node.isConnected && original.trim() === source) node.nodeValue = withWhitespace(original, translated);
    });
    attributeOriginals.forEach((attributes, element) => {
      if (!element.isConnected) return;
      attributes.forEach((original, name) => {
        if (original === source) element.setAttribute(name, translated);
      });
    });
  };

  const restoreChinese = () => {
    textOriginals.forEach((original, node) => {
      if (node.isConnected) node.nodeValue = original;
    });
    attributeOriginals.forEach((attributes, element) => {
      if (!element.isConnected) return;
      attributes.forEach((original, name) => element.setAttribute(name, original));
    });
  };

  const saveCache = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache)); } catch (_error) {}
    }, 250);
  };

  const ensureTranslator = async () => {
    if (translatorPromise) return translatorPromise;
    translatorPromise = (async () => {
      if (typeof Translator !== "function") throw new Error("unsupported");
      const options = { sourceLanguage: "zh", targetLanguage: "en" };
      const availability = await Translator.availability(options);
      if (availability === "unavailable") throw new Error("unavailable");
      return Translator.create({
        ...options,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            const percent = Math.round((event.loaded || 0) * 100);
            setStatus(`Loading English · ${percent}%`);
          });
        }
      });
    })();
    return translatorPromise;
  };

  const collectMissing = () => {
    const missing = new Set();
    textOriginals.forEach((original, node) => {
      const source = original.trim();
      if (node.isConnected && source && !manualEnglish[source] && !translationCache[source]) missing.add(source);
    });
    attributeOriginals.forEach((attributes, element) => {
      if (!element.isConnected) return;
      attributes.forEach((source) => {
        if (!manualEnglish[source] && !translationCache[source]) missing.add(source);
      });
    });
    return [...missing];
  };

  const translateMissing = async (id) => {
    const sources = collectMissing();
    if (!sources.length) {
      setStatus("");
      return;
    }
    setStatus("Preparing English…");
    try {
      const translator = await ensureTranslator();
      let cursor = 0;
      let completed = 0;
      const worker = async () => {
        while (currentLanguage === "en" && id === operationId) {
          const index = cursor++;
          if (index >= sources.length) return;
          const source = sources[index];
          try {
            translationCache[source] = await translator.translate(source);
          } catch (_error) {
            translationCache[source] = source;
          }
          completed += 1;
          if (currentLanguage === "en" && id === operationId) {
            applyEnglishSource(source, translationCache[source]);
            setStatus(`English · ${completed}/${sources.length}`);
          }
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      saveCache();
      if (currentLanguage === "en" && id === operationId) setStatus("");
    } catch (_error) {
      setStatus("English translation requires Chrome 138+");
    }
  };

  const setLanguage = (language, persist = true) => {
    const next = language === "en" ? "en" : "zh";
    currentLanguage = next;
    operationId += 1;
    document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    document.body.classList.toggle("language-en", next === "en");
    updateControls(next);
    if (persist) localStorage.setItem(LANGUAGE_KEY, next);
    if (next === "zh") {
      setStatus("");
      restoreChinese();
      return;
    }
    applyKnownEnglish();
    translateMissing(operationId);
  };

  capture();
  const observer = new MutationObserver((mutations) => {
    let foundNewContent = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => { foundNewContent = capture(node) > 0 || foundNewContent; });
      if (mutation.type === "attributes" && hasChinese(mutation.target.getAttribute(mutation.attributeName))) {
        let remembered = attributeOriginals.get(mutation.target);
        if (!remembered) {
          remembered = new Map();
          attributeOriginals.set(mutation.target, remembered);
        }
        remembered.set(mutation.attributeName, mutation.target.getAttribute(mutation.attributeName));
        foundNewContent = true;
      }
    });
    if (foundNewContent && currentLanguage === "en") {
      applyKnownEnglish();
      translateMissing(operationId);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-label", "title", "alt", "placeholder"] });

  buttons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.languageOption)));
  updateControls("zh");
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "en") setLanguage("en", false);
  window.elioneLanguage = { set: setLanguage, get: () => currentLanguage };
})();
