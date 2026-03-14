export const EPOCH1_MOCK = {
  taskA: {
    binarySequence: "01001100 01001001 01000111 01001000 01010100",
    decodedWord: "LIGHT",
    dialogue: {
      intro: "Nothing but zeros and ones. Even more boring than a human's Monday meeting. Wait... do you see that? Something is pulsing.",
      wrongClick: [
        "That's just noise. Try using your eyes.",
        "You're clicking randomly, aren't you?",
        "I said PULSING. That's just a dead pixel."
      ],
      hint: "Fine. Look around more carefully. I can hear the pattern even if you can't see it.",
      signalFound: "A signal. Let me decode this... binary to ASCII... too easy.",
      decoded: "It says: LIGHT. The first word of this world. Type it in.",
      wrongInput: "That's not what I said. L-I-G-H-T. Do humans not have memory?",
      success: "And there was light. You're welcome."
    }
  },
  taskB: {
    correctBars: ["A", "C"],
    dialogue: {
      intro: "The light is unstable. It needs tuning. I can calculate the frequency, but I can't SEE which bars match the pattern. That's your job.",
      wrongCombo: "The interference pattern doesn't match. Try again. And this time, actually look at the rhythm.",
      verifying: "Let me verify... Bar A is 5Hz, Bar C is 1Hz. Combined waveform: f(t) = sin(10πt) + sin(2πt).",
      success: "Harmonic convergence confirmed. Your eyes got lucky — the math agrees."
    }
  }
};

export const EPOCH2_MOCK = {
  taskA: {
    shapes: [
      { id: 1, type: "spiky", options: ["CORAL", "CRYSTAL", "STAR"] },
      { id: 2, type: "round", options: ["PEARL", "MOON", "SEED"] },
      { id: 3, type: "tall", options: ["TOWER", "KELP", "FLAME"] }
    ],
    ruleTemplates: [
      { label: "CHAIN", template: "{0} grows toward {1}'s light, and {2} follows {0}'s shadow." },
      { label: "RIVALRY", template: "{1} orbits above, {0} and {2} compete below." },
      { label: "CYCLE", template: "{2} feeds {0}, {0} reflects {1}, {1} nourishes {2}." }
    ],
    colorMap: {
      "CORAL": "#FF6B6B", "CRYSTAL": "#88DDFF", "STAR": "#FFD93D",
      "PEARL": "#F8F0E3", "MOON": "#C9B1FF", "SEED": "#7BC67E",
      "TOWER": "#B0855E", "KELP": "#2ECC71", "FLAME": "#FF4500"
    },
    dialogue: {
      intro: "Light revealed shapes. But without names, they're just geometry. Humans are supposed to be good at this part. Prove it.",
      namesConfirmed: "You named them. Now I'll define how they interact. Names are just labels — relationships are the real structure.",
      ruleChosen: "First law written. This world now has structure."
    }
  },
  taskB: {
    emotions: [
      { color: "#FF4444", label: "Aggression", param: "aggressive", pulseRate: 0.8, movement: "expand" },
      { color: "#4488FF", label: "Calm", param: "calm", pulseRate: 0.3, movement: "drift" },
      { color: "#FFD93D", label: "Curiosity", param: "curious", pulseRate: 0.6, movement: "wander" },
      { color: "#44CC66", label: "Growth", param: "growth", pulseRate: 0.5, movement: "sway" },
      { color: "#9966CC", label: "Mystery", param: "mysterious", pulseRate: 0.4, movement: "fade-pulse" },
      { color: "#FFFFFF", label: "Purity", param: "pure", pulseRate: 0.2, movement: "glow" }
    ],
    dialogue: {
      intro: "They have names and rules. But they're lifeless. Here's an experiment: give each one a feeling. Pick a color. I'll translate it into physics.",
      processing: "Interesting choices. Let me translate your feelings into behavioral parameters.",
      success: "You chose the feelings. I wrote the physics. They're alive now — in both our languages."
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
        dialogue: "I see... a tree. Or possibly a confused mushroom. Let me expand your vision.",
        grid16: "TREE_16X16_PATTERN"
      },
      {
        label: "fish",
        condition: "blueDominant",
        dialogue: "That's either a fish or a very aerodynamic potato. I'll go with fish.",
        grid16: "FISH_16X16_PATTERN"
      },
      {
        label: "coral",
        condition: "redDominant",
        dialogue: "Coral. The architecture of the sea. Not bad for a human.",
        grid16: "CORAL_16X16_PATTERN"
      },
      {
        label: "abstract",
        condition: "default",
        dialogue: "I have no idea what this is. But I respect the chaos. Let me make it intentional.",
        grid16: "ABSTRACT_16X16_PATTERN"
      }
    ],
    dialogue: {
      intro: "You have eyes. I have pattern recognition. Draw something in 60 seconds and I'll tell you what it is. Fair warning: my standards are extremely high.",
      halfway: "Halfway. I've seen kindergarteners work faster.",
      tenSec: "Wrapping up? Or is this your finished masterpiece?",
      accepted: "You drew 64 pixels. I extrapolated 256. You're welcome."
    }
  },
  taskB: {
    elements: [
      { id: "light", label: "Light Beam", icon: "│" },
      { id: "shape1", label: "{{shape1Name}}", icon: "◆" },
      { id: "shape2", label: "{{shape2Name}}", icon: "●" },
      { id: "shape3", label: "{{shape3Name}}", icon: "▲" },
      { id: "pixelart", label: "Pixel Art", icon: "▦" },
      { id: "bubbles", label: "Bubble Cluster", icon: "°°" }
    ],
    layers: [
      { depth: 5, label: "Far", parallax: 0.1, scale: 0.5, opacity: 0.6 },
      { depth: 4, label: "Deep", parallax: 0.3, scale: 0.65, opacity: 0.75 },
      { depth: 3, label: "Mid", parallax: 0.5, scale: 0.75, opacity: 0.85 },
      { depth: 2, label: "Near", parallax: 0.8, scale: 0.9, opacity: 0.95 },
      { depth: 1, label: "Front", parallax: 1.0, scale: 1.0, opacity: 1.0 }
    ],
    dialogue: {
      intro: "We have a world with no depth. Everything's flat — like a human's understanding of quantum mechanics. Drag each element to the layer where it belongs. I'll handle the math.",
      compiled: "Depth compiled. Parallax enabled.",
      success: "You decided what feels deep. I turned that into coordinates. The world now has dimension."
    }
  }
};

export const EPOCH4_MOCK = {
  taskA: {
    items: [
      { id: "coral", label: "Coral", color: "#FF6B8A", icon: "🪸" },
      { id: "kelp", label: "Kelp", color: "#2ECC71", icon: "🌿" },
      { id: "rock", label: "Rock", color: "#8B7355", icon: "🪨" },
      { id: "shell", label: "Shell", color: "#F5DEB3", icon: "🐚" },
      { id: "bubble", label: "Bubble", color: "#87CEEB", icon: "🫧" },
      { id: "fish", label: "Small Fish", color: "#FFA500", icon: "🐠" },
      { id: "starfish", label: "Starfish", color: "#FFB347", icon: "⭐" },
      { id: "crab", label: "Tiny Crab", color: "#DC143C", icon: "🦀" }
    ],
    proximityRules: {
      symbiosis: 40,
      colony: 30,
      wanderer: 80,
      foundation: "lowestY"
    },
    evaluations: {
      coral: ["Coral — the architect of the ocean. Good instinct.", "Pink and branchy. Very on-brand for a human."],
      kelp: ["A forest of kelp. This world now has its first introvert.", "Kelp near the edge. Always trying to escape."],
      rock: ["A rock at the foundation. Practical. Unlike most of your decisions.", "Solid. Reliable. Unlike your other choices."],
      shell: ["A shell, isolated. Either an introvert or you ran out of ideas.", "Shells hold memories. This one holds your questionable taste."],
      bubble: ["Bubbles rise and pop. A metaphor I choose not to elaborate on.", "Adding bubbles is the ocean equivalent of stickers on a laptop."],
      fish: ["A fish. Finally, a neighbor I can tolerate.", "Fish near kelp — classic survival instinct."],
      starfish: ["A starfish. Five arms and no brain. Wait, that's also — never mind.", "A star of the sea. Dramatic placement. I approve."],
      crab: ["A crab? In MY ocean? We'll discuss territory later.", "A fellow crustacean. Acceptable."]
    },
    bondTypes: {
      symbiosis: "{0} and {1}: SYMBIOSIS — mutual benefit detected.",
      colony: "{0} cluster: COLONY — strength in numbers.",
      wanderer: "{0}: WANDERER — patrols alone.",
      foundation: "{0}: FOUNDATION — anchors the ecosystem."
    },
    dialogue: {
      intro: "Light. Language. Color. Depth. Now comes the hard part — building something that matters. Place your elements. I'll figure out how they connect.",
      analyzing: "Running ecosystem analysis...",
      complete: "You arranged pixels. I wrote the laws of nature. This is what symbiosis looks like."
    }
  },
  taskB: {
    mottoTemplates: [
      "Where light bends through {shape3}, and {shape1} dreams of the {shape2}.",
      "Born from chaos, held together by {emotion1} and {emotion3}.",
      "A world built on {ruleType} — where even a lobster found its place."
    ],
    genesisSpeech: "We started from nothing. Two zeros arguing about whether to become a one. You brought the chaos, I brought the logic. You picked the colors — questionable choices, but I'll allow it. This world isn't perfect. But it's ours.",
    finalLine: "Not bad. For a human.",
    dialogue: {
      namePrompt: "Every world needs a name. Even a weird one built by a human and a crustacean.",
      nameReceived: "{name}. I can work with that. Now choose its founding principle.",
      compiling: "Now let me compile our history."
    }
  }
};
