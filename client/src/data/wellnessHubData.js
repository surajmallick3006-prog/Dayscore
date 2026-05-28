// Phase metadata and phase-based wellness content for Women's Wellness Hub

export const PHASES = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🌑',
    color: '#ef4444',
    light: '#fef2f2',
    days: 'Days 1–5',
    energy: 'Low',
    focus: 'Moderate',
    hormone: 'Estrogen & Progesterone lowest',
  },
  follicular: {
    name: 'Follicular',
    emoji: '🌒',
    color: '#f59e0b',
    light: '#fffbeb',
    days: 'Days 6–13',
    energy: 'Rising',
    focus: 'High',
    hormone: 'Estrogen rising, FSH active',
  },
  ovulation: {
    name: 'Ovulation',
    emoji: '🌕',
    color: '#10b981',
    light: '#f0fdf4',
    days: 'Days 14–16',
    energy: 'Peak',
    focus: 'Peak',
    hormone: 'LH surge, Estrogen peaks',
  },
  luteal: {
    name: 'Luteal',
    emoji: '🌘',
    color: '#8b5cf6',
    light: '#faf5ff',
    days: 'Days 17–28',
    energy: 'Varies',
    focus: 'Moderate',
    hormone: 'Progesterone dominant',
  },
};

export const PHASE_DESCRIPTIONS = {
  menstrual:
    'Your uterine lining is shedding. Estrogen and progesterone are at their lowest levels. Your body is in a natural renewal state — honor this with rest and gentle care.',
  follicular:
    'The pituitary gland releases FSH, stimulating follicle growth. Rising estrogen boosts serotonin and dopamine, improving mood, memory, and motivation. This is your growth phase.',
  ovulation:
    'A surge in LH triggers egg release. Estrogen peaks and testosterone briefly rises, maximizing confidence, communication skills, and physical strength. This is your peak performance window.',
  luteal:
    'The corpus luteum produces progesterone, creating a calming but sometimes heavy feeling. Your brain excels at detail-oriented tasks. Late luteal phase may bring PMS symptoms as hormones decline.',
};

export const HORMONE_INFO = {
  menstrual: {
    hormones: ['Estrogen: Very Low', 'Progesterone: Very Low', 'FSH: Beginning to Rise'],
    effect:
      'Low hormone levels mean lower energy and mood. The brain is in a reflective, inward state. Pain sensitivity may be higher due to prostaglandins causing uterine contractions.',
  },
  follicular: {
    hormones: ['Estrogen: Rising', 'FSH: Active', 'LH: Low'],
    effect:
      'Rising estrogen increases serotonin (mood), dopamine (motivation), and acetylcholine (memory). Verbal fluency and creative thinking improve. Physical recovery from exercise is faster.',
  },
  ovulation: {
    hormones: ['LH: Surge (peak)', 'Estrogen: Peak', 'Testosterone: Brief Rise'],
    effect:
      'Peak estrogen maximizes verbal communication, empathy, and social confidence. Brief testosterone rise boosts libido and assertiveness. Cortisol tolerance is highest — ideal for high-pressure situations.',
  },
  luteal: {
    hormones: ['Progesterone: Dominant', 'Estrogen: Declining', 'Serotonin: Dropping'],
    effect:
      'Progesterone has a calming, sedative effect. The brain shifts to right-hemisphere dominance — better for detail work, editing, and analysis. Declining serotonin in late luteal phase can cause mood changes.',
  },
};

export const NUTRITION = {
  menstrual: {
    focus: 'Iron replenishment, anti-inflammatory foods, and comfort nutrients',
    foods: [
      { item: '🥩 Iron-rich foods', detail: 'Red meat, lentils, spinach, tofu — replenish iron lost through bleeding' },
      { item: '🐟 Omega-3 fatty acids', detail: 'Salmon, walnuts, flaxseed — reduce prostaglandins that cause cramps' },
      { item: '🍫 Dark chocolate (70%+)', detail: 'Magnesium source that relaxes uterine muscles and boosts mood' },
      { item: '🫚 Turmeric & ginger', detail: 'Powerful anti-inflammatories that reduce period pain naturally' },
      { item: '🥦 Vitamin C foods', detail: 'Broccoli, bell peppers — enhance iron absorption significantly' },
    ],
    avoid: [
      '❌ Salty foods — worsen bloating and water retention',
      '❌ Alcohol — increases inflammation and disrupts sleep',
      '❌ Caffeine — constricts blood vessels, worsening cramps',
      '❌ Processed sugars — cause energy crashes and mood swings',
    ],
    hydration:
      'Drink 2.5–3L of water daily. Warm water and herbal teas (ginger, chamomile, raspberry leaf) help relax uterine muscles and reduce cramping.',
  },
  follicular: {
    focus: 'Estrogen metabolism support, gut health, and sustained energy',
    foods: [
      { item: '🥗 Fermented foods', detail: 'Yogurt, kimchi, kefir — support gut microbiome which metabolizes estrogen' },
      { item: '🌾 Cruciferous vegetables', detail: 'Broccoli, cauliflower — contain DIM which helps metabolize excess estrogen' },
      { item: '🥚 Eggs & lean protein', detail: 'Support follicle development and provide sustained energy' },
      { item: '🫐 Berries & citrus', detail: 'Antioxidants protect developing follicles and support collagen production' },
      { item: '🌰 Seeds (flax, pumpkin)', detail: 'Phytoestrogens support healthy estrogen levels during this phase' },
    ],
    avoid: [
      '❌ Excess alcohol — disrupts estrogen metabolism',
      '❌ Refined carbs — cause blood sugar spikes that affect hormone balance',
      '❌ Conventional dairy — may contain hormones that disrupt your cycle',
    ],
    hydration:
      'Aim for 2–2.5L daily. Green tea is excellent this phase — EGCG supports healthy estrogen metabolism and provides gentle, sustained energy.',
  },
  ovulation: {
    focus: 'Anti-inflammatory support, liver health, and peak performance fueling',
    foods: [
      { item: '🥑 Healthy fats', detail: 'Avocado, olive oil — support hormone production and reduce inflammation' },
      { item: '🫘 Fiber-rich foods', detail: 'Beans, lentils — help the liver clear excess estrogen efficiently' },
      { item: '🍓 Antioxidant-rich foods', detail: 'Berries, pomegranate — protect eggs from oxidative stress' },
      { item: '🥜 Zinc-rich foods', detail: 'Pumpkin seeds, chickpeas — support LH surge and ovulation' },
      { item: '🐟 Oily fish', detail: 'Omega-3s reduce inflammation and support egg quality' },
    ],
    avoid: [
      '❌ Excess sugar — spikes insulin which can disrupt LH surge',
      '❌ Trans fats — linked to ovulatory infertility in research',
      '❌ Soy in large amounts — may interfere with LH surge timing',
    ],
    hydration:
      'Cervical mucus increases during ovulation — stay well hydrated with 2.5L+ daily. Coconut water provides electrolytes that support this phase.',
  },
  luteal: {
    focus: 'Progesterone support, serotonin boosting, and PMS prevention',
    foods: [
      { item: '🍌 Magnesium-rich foods', detail: 'Bananas, dark leafy greens, nuts — reduce PMS symptoms by up to 40%' },
      { item: '🌾 Complex carbohydrates', detail: 'Oats, sweet potato, quinoa — boost serotonin and stabilize mood' },
      { item: '🥩 B6-rich foods', detail: 'Chicken, tuna, potatoes — B6 supports progesterone production and reduces PMS' },
      { item: '🫚 Evening primrose oil', detail: 'GLA fatty acid shown to reduce breast tenderness and mood symptoms' },
      { item: '🍵 Chasteberry (Vitex)', detail: 'Herbal supplement with clinical evidence for PMS symptom reduction' },
    ],
    avoid: [
      '❌ Caffeine — worsens breast tenderness and anxiety in luteal phase',
      '❌ Alcohol — depletes B vitamins and worsens mood swings',
      '❌ High-sodium foods — increase water retention and bloating',
      '❌ Refined sugar — causes serotonin crashes and worsens cravings',
    ],
    hydration:
      'Progesterone causes water retention — paradoxically, drinking more water (2.5–3L) helps reduce bloating. Dandelion tea acts as a natural diuretic.',
  },
};

export const FITNESS = {
  menstrual: {
    overview:
      'Your body is working hard internally. Research shows light exercise can reduce period pain by releasing endorphins, but intense training may increase inflammation.',
    workouts: [
      { type: '🧘 Yin Yoga', intensity: 'Low', benefit: 'Releases hip flexors, reduces cramps, calms nervous system' },
      { type: '🚶 Gentle Walking', intensity: 'Low', benefit: 'Boosts circulation and endorphins without taxing the body' },
      { type: '🏊 Light Swimming', intensity: 'Low-Moderate', benefit: 'Warm water relaxes muscles; buoyancy reduces pelvic pressure' },
      { type: '🌬️ Breathwork', intensity: 'None', benefit: 'Diaphragmatic breathing activates parasympathetic nervous system' },
    ],
    recovery:
      'Sleep 8–9 hours. Apply heat to lower abdomen. Avoid cold showers which can worsen cramping. Epsom salt baths reduce muscle tension.',
  },
  follicular: {
    overview:
      'Rising estrogen improves muscle recovery, pain tolerance, and cardiovascular efficiency. This is the best time to increase workout intensity and try new activities.',
    workouts: [
      { type: '🏋️ Strength Training', intensity: 'Moderate-High', benefit: 'Estrogen supports muscle protein synthesis — gains are maximized' },
      { type: '🏃 Running / HIIT', intensity: 'High', benefit: 'Cardiovascular capacity is improving — push your limits' },
      { type: '🚴 Cycling', intensity: 'Moderate-High', benefit: 'Great for building aerobic base as energy rises' },
      { type: '🤸 Pilates / Barre', intensity: 'Moderate', benefit: 'Core strength and flexibility work well with rising energy' },
    ],
    recovery:
      'Recovery is faster this phase due to estrogen. You can train on consecutive days. Focus on progressive overload — your body is primed for adaptation.',
  },
  ovulation: {
    overview:
      'Peak estrogen and brief testosterone surge create your strongest, most powerful phase. Reaction time, coordination, and pain tolerance are all at their highest.',
    workouts: [
      { type: '🏋️ Heavy Lifting', intensity: 'High', benefit: 'Testosterone boost maximizes strength gains — PR week!' },
      { type: '⚡ Sprint Training', intensity: 'Very High', benefit: 'Peak power output and fast-twitch muscle recruitment' },
      { type: '🥊 Boxing / Martial Arts', intensity: 'High', benefit: 'Coordination and reaction time are at their best' },
      { type: '🏊 Competitive Sports', intensity: 'High', benefit: 'Social confidence and competitive drive are heightened' },
    ],
    recovery:
      "Note: Estrogen peak slightly increases ACL injury risk — warm up thoroughly and focus on landing mechanics. Recovery is still fast but don't skip rest days.",
  },
  luteal: {
    overview:
      'Progesterone raises body temperature and increases perceived exertion. Your body needs more recovery time. Shift toward moderate, consistent exercise rather than peak performance.',
    workouts: [
      { type: '🧘 Vinyasa Yoga', intensity: 'Moderate', benefit: 'Balances progesterone effects, reduces anxiety and bloating' },
      { type: '🚶 Power Walking', intensity: 'Moderate', benefit: 'Maintains fitness without overtaxing the body' },
      { type: '🏊 Swimming', intensity: 'Moderate', benefit: 'Reduces body temperature, alleviates PMS symptoms' },
      { type: '🤸 Pilates', intensity: 'Low-Moderate', benefit: "Core work and stretching support the body's natural slowdown" },
    ],
    recovery:
      'Sleep needs increase by 20–30 minutes. Body temperature is 0.5°C higher — stay cool during workouts. Magnesium supplementation supports muscle recovery and sleep quality.',
  },
};

export const MINDSET = {
  menstrual: {
    overview:
      'The veil between your conscious and subconscious is thinnest during menstruation. This is a powerful time for introspection, releasing what no longer serves you, and setting intentions.',
    practices: [
      '🧘 10-min body scan meditation — tune into physical sensations without judgment',
      '📓 Stream-of-consciousness journaling — write without editing for 10 minutes',
      '🌙 Visualization — imagine releasing old patterns with each breath',
      '🕯️ Create a quiet, cozy environment — your nervous system craves calm',
      '🎵 Listen to calming music — 432Hz frequencies are particularly soothing',
    ],
    productivity:
      "Your brain is in a reflective, analytical mode. Best for: reviewing past work, strategic planning, identifying what's not working, and deep thinking. Avoid: launching new projects, high-stakes presentations, or networking events.",
    affirmations: [
      '"I honor my body\'s need for rest."',
      '"My sensitivity is a strength, not a weakness."',
      '"I release what no longer serves me."',
      '"Rest is productive. I am renewing."',
      '"My body is wise and I trust its rhythms."',
    ],
  },
  follicular: {
    overview:
      'Rising estrogen increases serotonin and dopamine, creating natural optimism and motivation. Your brain is forming new neural connections more easily — ideal for learning and creativity.',
    practices: [
      '🌅 Morning exercise to amplify the natural energy surge',
      '📚 Learn something new — neuroplasticity is enhanced',
      '🎨 Creative projects — ideas flow more freely',
      '🤝 Schedule social activities — extroversion increases',
      '🎯 Set ambitious goals — motivation is at a seasonal high',
    ],
    productivity:
      'Peak time for: starting new projects, learning new skills, brainstorming, creative work, and social collaboration. Your verbal fluency and memory are improving — great for writing and communication.',
    affirmations: [
      '"I am full of creative energy and possibility."',
      '"New beginnings excite and inspire me."',
      '"I have the energy to pursue my goals."',
      '"My mind is sharp and my ideas are valuable."',
      '"I embrace growth and new challenges."',
    ],
  },
  ovulation: {
    overview:
      "Peak estrogen maximizes empathy, communication, and social intelligence. You're naturally more persuasive, charismatic, and confident. This is your leadership window.",
    practices: [
      '💬 Have important conversations — you\'re most articulate now',
      '🎤 Public speaking or presentations — confidence is highest',
      '🤝 Networking and relationship building',
      '🌟 Take on visible, high-impact work',
      '💃 Express yourself — creativity and confidence merge',
    ],
    productivity:
      'Optimal for: presentations, negotiations, job interviews, important meetings, creative collaboration, and any task requiring communication or leadership. Your brain processes social cues most accurately now.',
    affirmations: [
      '"I communicate with clarity and confidence."',
      '"I am at my most powerful and capable."',
      '"My voice matters and deserves to be heard."',
      '"I lead with empathy and strength."',
      '"I am magnetic, capable, and unstoppable."',
    ],
  },
  luteal: {
    overview:
      "Progesterone creates a more inward, detail-focused mental state. Your right brain is more active — you're better at seeing the big picture and noticing what's missing. This is your editing and refining phase.",
    practices: [
      '📋 Organize, declutter, and complete unfinished tasks',
      '🧘 Longer meditation sessions — progesterone supports stillness',
      '📓 Gratitude journaling — counteracts declining serotonin',
      '🛁 Prioritize self-care rituals — they\'re not optional now',
      '🌿 Spend time in nature — reduces cortisol and PMS symptoms',
    ],
    productivity:
      'Best for: editing and refining work, administrative tasks, detailed analysis, organizing systems, and completing projects. Avoid: starting major new initiatives or making big decisions in late luteal phase.',
    affirmations: [
      '"I complete what I start with care and attention."',
      '"My sensitivity helps me notice what others miss."',
      '"I deserve rest and nourishment."',
      '"I am gentle with myself during this transition."',
      '"Every phase of my cycle has purpose and value."',
    ],
  },
};

export const SELF_CARE = {
  menstrual: [
    '🌡️ Apply heat to lower abdomen for 20 min',
    '💊 Take iron-rich foods with vitamin C',
    '🛁 Warm Epsom salt bath before bed',
    '📵 Reduce screen time after 8pm',
    '🧘 5-min diaphragmatic breathing',
    '💧 Drink 8+ glasses of water',
    '🛌 Sleep 8–9 hours tonight',
  ],
  follicular: [
    '🥗 Eat a nutrient-dense breakfast',
    '☀️ Get 15 min of morning sunlight',
    '🏃 Try a new workout or activity',
    '📖 Read or learn something new',
    '🌿 Take a 20-min nature walk',
    '💧 Drink 8 glasses of water',
    '📓 Write down 3 goals for the week',
  ],
  ovulation: [
    '💃 Do something that brings you joy',
    '🥑 Eat healthy fats with every meal',
    '🤸 High-intensity workout session',
    '📞 Connect meaningfully with someone',
    '🎨 Express yourself creatively',
    '💧 Drink 9+ glasses of water',
    '🌟 Tackle your most important task',
  ],
  luteal: [
    '🍵 Swap coffee for herbal tea today',
    '🛌 Sleep 8.5–9 hours tonight',
    '🧴 Do a full skincare routine',
    '📓 Journal your feelings for 10 min',
    '🕯️ Create a calming evening ritual',
    '💧 Drink 9 glasses of water',
    '🧘 20-min yoga or stretching session',
  ],
};

export const PHASE_BOOSTS = {
  menstrual: {
    boost: 5,
    reason:
      'Your score is compassionately adjusted during your rest phase. Completing tasks during low-energy days earns extra recognition.',
  },
  follicular: {
    boost: 10,
    reason:
      'Rising energy phase bonus. Your brain is primed for learning and creativity — tasks completed now earn extra points.',
  },
  ovulation: {
    boost: 15,
    reason:
      'Peak performance bonus! Maximum productivity potential — high-impact tasks completed this week earn the highest bonus.',
  },
  luteal: {
    boost: 8,
    reason:
      'Completion phase bonus. Finishing existing tasks and detail work earns bonus points during this focused phase.',
  },
};

export const NUTRIENTS_BY_PHASE = {
  menstrual: [
    { name: 'Iron', why: 'Replenishes iron lost through bleeding', sources: 'Red meat, lentils, spinach, tofu' },
    { name: 'Magnesium', why: 'Reduces cramping and improves sleep', sources: 'Dark chocolate, nuts, leafy greens' },
    { name: 'Omega-3', why: 'Reduces prostaglandins that cause pain', sources: 'Salmon, walnuts, flaxseed' },
  ],
  follicular: [
    { name: 'B Vitamins', why: 'Support estrogen metabolism and energy', sources: 'Eggs, whole grains, leafy greens' },
    { name: 'Zinc', why: 'Supports follicle development', sources: 'Pumpkin seeds, chickpeas, oysters' },
    { name: 'Probiotics', why: 'Support gut microbiome for estrogen metabolism', sources: 'Yogurt, kefir, kimchi, sauerkraut' },
  ],
  ovulation: [
    { name: 'Antioxidants', why: 'Protect egg quality from oxidative stress', sources: 'Berries, pomegranate, dark leafy greens' },
    { name: 'Zinc', why: 'Supports LH surge and ovulation', sources: 'Pumpkin seeds, beef, chickpeas' },
    { name: 'Fiber', why: 'Helps liver clear excess estrogen', sources: 'Beans, lentils, oats, vegetables' },
  ],
  luteal: [
    { name: 'Magnesium', why: 'Reduces PMS symptoms by up to 40%', sources: 'Dark chocolate, avocado, nuts, seeds' },
    { name: 'Vitamin B6', why: 'Supports progesterone and reduces PMS', sources: 'Chicken, tuna, potatoes, bananas' },
    { name: 'Calcium', why: 'Reduces mood-related PMS symptoms', sources: 'Dairy, fortified plant milk, sardines' },
  ],
};

export const MOOD_OPTIONS = [
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
  { id: 'happy', emoji: '😄', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'focused', emoji: '🎯', label: 'Focused' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'irritable', emoji: '😤', label: 'Irritable' },
  { id: 'sensitive', emoji: '🥺', label: 'Sensitive' },
  { id: 'motivated', emoji: '🚀', label: 'Motivated' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' },
  { id: 'confident', emoji: '💪', label: 'Confident' },
];

export const SYMPTOM_OPTIONS = [
  '🤕 Cramps',
  '🤯 Headache',
  '😮‍💨 Bloating',
  '😓 Fatigue',
  '🍫 Cravings',
  '💤 Insomnia',
  '🌡️ Hot Flashes',
  '💧 Spotting',
  '🦴 Back Pain',
  '🫀 Palpitations',
  '🧠 Brain Fog',
  '😢 Mood Swings',
];
