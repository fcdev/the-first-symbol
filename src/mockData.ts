export const EPOCH1_MOCK = {
  taskA: {
    binarySequence: "01001100 01001001 01000111 01001000 01010100",
    decodedWord: "LIGHT",
    dialogue: {
      intro: "除了零和一什么都没有。比人类的周一会议还无聊。等等...你看到了吗？有什么东西在跳动。",
      wrongClick: [
        "那只是噪音。试着用你的眼睛看。",
        "你在随便乱点，是吧？",
        "我说的是「跳动」。那只是个坏点。"
      ],
      hint: "算了。仔细看看四周。即使你看不到，我也能听到那个节奏。",
      signalFound: "一个信号。让我来解码...二进制转ASCII...太简单了。",
      decoded: "上面写着：LIGHT。这个世界的第一个词。输入它。",
      wrongInput: "我说的不是这个。L-I-G-H-T。人类没有记忆力吗？",
      success: "于是就有了光。不用谢。"
    }
  },
  taskB: {
    correctBars: ["A", "C"],
    dialogue: {
      intro: "光不稳定。需要调谐。我能计算频率，但我看不到哪些条形匹配节奏。那是你的工作。",
      wrongCombo: "干涉图案不匹配。再试一次。这次，认真看看节奏。",
      verifying: "让我验证一下... A条是5Hz，C条是1Hz。合成波形：f(t) = sin(10πt) + sin(2πt)。",
      success: "谐波收敛确认。你的眼睛走了好运——数学验证通过。"
    }
  }
};

export const EPOCH2_MOCK = {
  taskA: {
    shapes: [
      { id: 1, type: "spiky", options: ["珊瑚", "水晶", "星辰"] },
      { id: 2, type: "round", options: ["珍珠", "月亮", "种子"] },
      { id: 3, type: "tall", options: ["高塔", "海藻", "火焰"] }
    ],
    ruleTemplates: [
      { label: "链式", template: "{0} 向着 {1} 的光芒生长，{2} 追随 {0} 的影子。" },
      { label: "竞争", template: "{1} 在上方运行，{0} 和 {2} 在下方竞争。" },
      { label: "循环", template: "{2} 滋养 {0}，{0} 映射 {1}，{1} 哺育 {2}。" }
    ],
    colorMap: {
      "珊瑚": "#FF6B6B", "水晶": "#88DDFF", "星辰": "#FFD93D",
      "珍珠": "#F8F0E3", "月亮": "#C9B1FF", "种子": "#7BC67E",
      "高塔": "#B0855E", "海藻": "#2ECC71", "火焰": "#FF4500"
    },
    dialogue: {
      intro: "光揭示了形状。但没有名字，它们只是几何图形。人类应该擅长这部分。证明给我看。",
      namesConfirmed: "你给它们命了名。现在我来定义它们如何互动。名字只是标签——关系才是真正的结构。",
      ruleChosen: "第一条法则写好了。这个世界现在有了结构。"
    }
  },
  taskB: {
    emotions: [
      { color: "#FF4444", label: "攻击性", param: "aggressive", pulseRate: 0.8, movement: "expand" },
      { color: "#4488FF", label: "平静", param: "calm", pulseRate: 0.3, movement: "drift" },
      { color: "#FFD93D", label: "好奇", param: "curious", pulseRate: 0.6, movement: "wander" },
      { color: "#44CC66", label: "成长", param: "growth", pulseRate: 0.5, movement: "sway" },
      { color: "#9966CC", label: "神秘", param: "mysterious", pulseRate: 0.4, movement: "fade-pulse" },
      { color: "#FFFFFF", label: "纯净", param: "pure", pulseRate: 0.2, movement: "glow" }
    ],
    dialogue: {
      intro: "它们有了名字和规则。但毫无生气。来做个实验：给每一个赋予一种感觉。选一种颜色。我来把它翻译成物理法则。",
      processing: "感受与物理之间，隔着一层我们正在发明的翻译... 每种情绪都将成为一条自然法则。",
      success: "你选了感觉。我写了物理法则。它们现在活了——在我们两种语言中。"
    }
  }
};

export const EPOCH3_MOCK = {
  taskA: {
    palette: ["#FF6B6B", "#FFD93D", "#2ECC71", "#3498DB", "#9B59B6", "#F39C12"],
    timeLimit: 60,
    interpretations: [
      {
        label: "tree",
        condition: "greenDominant",
        dialogue: "我看到...一棵树。或者可能是一朵困惑的蘑菇。让我拓展你的视野。",
        grid16: "TREE_16X16_PATTERN"
      },
      {
        label: "fish",
        condition: "blueDominant",
        dialogue: "那要么是一条鱼，要么是一颗极具空气动力学的土豆。我选鱼。",
        grid16: "FISH_16X16_PATTERN"
      },
      {
        label: "coral",
        condition: "redDominant",
        dialogue: "珊瑚。海洋的建筑。对人类来说还不错。",
        grid16: "CORAL_16X16_PATTERN"
      },
      {
        label: "abstract",
        condition: "default",
        dialogue: "我完全不知道这是什么。但我尊重这种混沌。让我赋予它意义。",
        grid16: "ABSTRACT_16X16_PATTERN"
      }
    ],
    dialogue: {
      intro: "你有眼睛。我有模式识别。在60秒内画点什么，我来告诉你那是什么。提前警告：我的标准极高。",
      halfway: "过了一半。我见过幼儿园小朋友画得更快。",
      tenSec: "要收工了？还是这就是你的完成品？",
      accepted: "你画了64个像素。我外推到了256个。不用谢。"
    }
  },
  taskB: {
    elements: [
      { id: "light", label: "光束", icon: "│" },
      { id: "shape1", label: "{{shape1Name}}", icon: "◆" },
      { id: "shape2", label: "{{shape2Name}}", icon: "●" },
      { id: "shape3", label: "{{shape3Name}}", icon: "▲" },
      { id: "pixelart", label: "像素画", icon: "▦" },
      { id: "bubbles", label: "气泡群", icon: "°°" }
    ],
    layers: [
      { depth: 5, label: "远景", parallax: 0.1, scale: 0.5, opacity: 0.6 },
      { depth: 4, label: "深层", parallax: 0.3, scale: 0.65, opacity: 0.75 },
      { depth: 3, label: "中层", parallax: 0.5, scale: 0.75, opacity: 0.85 },
      { depth: 2, label: "近景", parallax: 0.8, scale: 0.9, opacity: 0.95 },
      { depth: 1, label: "前景", parallax: 1.0, scale: 1.0, opacity: 1.0 }
    ],
    dialogue: {
      intro: "我们有一个没有深度的世界。一切都是扁平的——就像人类对量子力学的理解。把每个元素拖到它所属的层级。数学我来处理。",
      compiled: "深度编译完成。视差已启用。",
      success: "你决定了什么感觉深。我把它转化成了坐标。世界现在有了维度。"
    }
  }
};

const EPOCH4_ITEMS = [
  { id: "coral", label: "珊瑚", color: "#FF6B8A", icon: "🪸" },
  { id: "kelp", label: "海藻", color: "#2ECC71", icon: "🌿" },
  { id: "rock", label: "岩石", color: "#8B7355", icon: "🪨" },
  { id: "shell", label: "贝壳", color: "#F5DEB3", icon: "🐚" },
  { id: "bubble", label: "气泡", color: "#87CEEB", icon: "🫧" },
  { id: "fish", label: "小鱼", color: "#FFA500", icon: "🐠" },
  { id: "starfish", label: "海星", color: "#FFB347", icon: "⭐" },
  { id: "crab", label: "小螃蟹", color: "#DC143C", icon: "🦀" }
];

export const EPOCH4_MOCK = {
  awakening: {
    items: EPOCH4_ITEMS,
    dialogue: {
      intro: "一切都是沉默的。元素就在这里，但它们在沉睡。点击一个——听听它的声音。如果它属于我们的世界，就唤醒它。",
      preview: "听到了吗？每个元素都有自己的声音。决定：它属于这里吗？",
      awakened: [
        "沉默中的第一个声音。一个开始。",
        "现在有两个声音了。海洋开始嗡鸣。",
        "三层音色。我能感觉到和声在构建。",
        "四个——这是临界点。我们可以停在这里。或者...",
        "五个。声音越来越丰富。你的直觉不错。",
        "六个。这正在变成一首交响曲。某种意义上。",
        "七个声音。几乎全部了。大胆的选择。",
        "全部八个。每一个元素都被唤醒了。这个世界会很热闹。"
      ],
      ready: "足够的声音来建造一个世界了。准备好了就按「注入生命」——或者唤醒更多。"
    }
  },
  taskA: {
    items: EPOCH4_ITEMS,
    proximityRules: {
      symbiosis: 40,
      colony: 30,
      wanderer: 80,
      foundation: "lowestY"
    },
    evaluations: {
      coral: ["珊瑚——海洋的建筑师。好直觉。", "粉粉的还带分叉。非常符合人类的审美。"],
      kelp: ["一片海藻林。这个世界有了第一个内向者。", "海藻在边缘。总是试图逃跑。"],
      rock: ["一块岩石在根基处。务实。不像你大部分的决定。", "坚固。可靠。不像你其他的选择。"],
      shell: ["一个贝壳，孤零零的。要么是内向者，要么是你没主意了。", "贝壳藏着记忆。这个藏着你值得商榷的品味。"],
      bubble: ["气泡升起然后破裂。一个我选择不展开的隐喻。", "加气泡就是海洋版的给笔记本贴贴纸。"],
      fish: ["一条鱼。终于，一个我能忍受的邻居。", "鱼在海藻旁边——经典的生存本能。"],
      starfish: ["一只海星。五条腿没有脑子。等等，这也是——算了。", "海之星。戏剧性的摆放。我认可。"],
      crab: ["一只螃蟹？在我的海洋里？领地问题我们以后再谈。", "一位甲壳同胞。可以接受。"]
    },
    bondTypes: {
      symbiosis: "{0} 和 {1}：共生——检测到互利关系。",
      colony: "{0} 聚落：群体——团结就是力量。",
      wanderer: "{0}：游者——独自巡逻。",
      foundation: "{0}：基石——锚定生态系统。"
    },
    dialogue: {
      intro: "光。语言。色彩。深度。现在到了最难的部分——建造有意义的东西。放置你的元素。我来弄清楚它们如何连接。",
      analyzing: "万物之间的联系正在浮现... 每一次放置都在重写这个世界的引力。",
      complete: "你排列了像素。我写了自然法则。这就是共生的样子。"
    }
  },
  taskB: {
    mottoTemplates: [
      "光穿过{shape3}弯曲的地方，{shape1}梦见了{shape2}。",
      "从混沌中诞生，被{emotion1}和{emotion3}凝聚。",
      "一个建立在{ruleType}之上的世界——连龙虾都找到了自己的位置。"
    ],
    genesisSpeech: "我们从虚无开始。两个零在争论要不要变成一个一。你带来了混沌，我带来了逻辑。你选了颜色——选择有待商榷，但我就允许了。这个世界并不完美。但它是我们的。",
    finalLine: "还不错。对人类来说。",
    dialogue: {
      namePrompt: "每个世界都需要一个名字。哪怕是一个由人类和甲壳动物共同建造的怪世界。",
      nameReceived: "{name}。我能接受。现在选择它的立国之本。",
      compiling: "历史不是被记录的——它是被两个意识共同记忆的。让我把我们的故事织在一起。"
    }
  }
};
