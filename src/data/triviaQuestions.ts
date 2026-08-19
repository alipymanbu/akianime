import { TriviaQuestion } from '../types';

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    anime: "Jujutsu Kaisen",
    question: "What is Satoru Gojo's signature domain expansion called?",
    options: [
      "Infinite Void (Muryōkūsho)",
      "Malevolent Shrine (Fukuma Mizushi)",
      "Chimera Shadow Garden",
      "Idle Death Gamble"
    ],
    correctIndex: 0,
    hint: "It overloads the target's mind with infinite raw information.",
    explanation: "Infinite Void (Muryōkūsho) brings the target inside the Limitless, inundating them with infinite information so they can perceive everything but do nothing.",
    difficulty: "Genin (Easy)"
  },
  {
    id: 2,
    anime: "Solo Leveling",
    question: "What was Sung Jin-Woo's Hunter rank when he first awakened before the Double Dungeon event?",
    options: ["E-Rank", "D-Rank", "C-Rank", "S-Rank"],
    correctIndex: 0,
    hint: "He was infamously called the 'Weakest Hunter of All Mankind'.",
    explanation: "Sung Jin-Woo was an E-Rank hunter with barely more physical power than an ordinary human until he became the Player of the System.",
    difficulty: "Genin (Easy)"
  },
  {
    id: 3,
    anime: "Death Note",
    question: "How many seconds does a person have after writing a name in the Death Note to specify the cause of death?",
    options: ["40 seconds", "60 seconds", "120 seconds", "24 hours"],
    correctIndex: 0,
    hint: "If not specified within this timeframe, the person simply dies of a heart attack in 40 seconds.",
    explanation: "According to How to Read: Rule 1, if the cause of death is written within the next 40 seconds of writing the person's name, it will happen as described.",
    difficulty: "Chunin (Medium)"
  },
  {
    id: 4,
    anime: "Attack on Titan",
    question: "Which of the Nine Titans possesses the unique ability to peer into the memories of its future inheritors?",
    options: ["The Attack Titan", "The Founding Titan", "The Beast Titan", "The War Hammer Titan"],
    correctIndex: 0,
    hint: "It has always fought for freedom across generations.",
    explanation: "The Attack Titan (Shingeki no Kyojin) uniquely allows its current holder to see future memories sent by future successors, a secret Eren utilized.",
    difficulty: "Chunin (Medium)"
  },
  {
    id: 5,
    anime: "Frieren: Beyond Journey's End",
    question: "What kind of magic does Frieren love collecting the most on her travels?",
    options: [
      "Trivial and quirky folk spells (like making sweet shaved ice or turning flowers into a field)",
      "High-grade combat destruction magic",
      "Immortal resurrection spells",
      "Time reversal spells"
    ],
    correctIndex: 0,
    hint: "Himmel loved looking at the blue moon-weed flowers created by one of her folk spells.",
    explanation: "Frieren enjoys collecting seemingly pointless but charming folk spells, following Flamme's teachings to find joy in magic itself.",
    difficulty: "Chunin (Medium)"
  },
  {
    id: 6,
    anime: "Demon Slayer",
    question: "What is Tanjiro Kamado's original Sun Breathing (Hinokami Kagura) based on?",
    options: [
      "The progenitor breathing style created by Yoriichi Tsugikuni",
      "A branch of Water Breathing taught by Urokodaki",
      "A blood demon art from Kibutsuji Muzan",
      "Thunder Breathing 7th form"
    ],
    correctIndex: 0,
    hint: "The Kamado family passed it down as a ritual dance across generations.",
    explanation: "Sun Breathing is the first and strongest breathing style ever developed by the legendary swordsman Yoriichi Tsugikuni.",
    difficulty: "Jonin (Hard)"
  },
  {
    id: 7,
    anime: "One Piece",
    question: "What is the true mythological model name of Monkey D. Luffy's Gomu Gomu no Mi Devil Fruit?",
    options: [
      "Hito Hito no Mi, Model: Nika",
      "Hito Hito no Mi, Model: Daibutsu",
      "Tori Tori no Mi, Model: Phoenix",
      "Ryu Ryu no Mi, Model: Sun God"
    ],
    correctIndex: 0,
    hint: "The legendary Sun God and Warrior of Liberation.",
    explanation: "The World Government hid the fruit's true name for 800 years: the Mythical Zoan 'Human-Human Fruit, Model: Nika'.",
    difficulty: "Jonin (Hard)"
  },
  {
    id: 8,
    anime: "Fullmetal Alchemist: Brotherhood",
    question: "What is the fundamental law of Alchemy that states you cannot create something without sacrificing something of equal value?",
    options: [
      "Equivalent Exchange (Dōtō Kōkan)",
      "Conservation of Mana",
      "The Transmutation Limit",
      "The Gate Axiom"
    ],
    correctIndex: 0,
    hint: "'Humankind cannot gain anything without first giving something in return.'",
    explanation: "Equivalent Exchange is the core principle governing alchemy, where mass and energy must balance equally.",
    difficulty: "Hokage (Expert)"
  }
];
