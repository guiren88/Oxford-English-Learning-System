export interface Word {
  word: string;
  phonetic: string;
  translation: string;
}

export interface Sentence {
  english: string;
  chinese: string;
}

export interface Unit {
  unit: string;
  title: string;
  words: Word[];
  sentences: Sentence[];
  text: string;
  tips: string[];
}

export interface VocabularyDatabase {
  [key: string]: Unit[];
}

export const vocabularyData: VocabularyDatabase = {
  grade_1a: [
    {
      unit: "Unit 1",
      title: "Greetings",
      text: "句型：Greetings (问候)\n在日常生活中，用 English 进行简单的问候。我们学习了 Good morning, Hello, Goodbye 和 How are you. 让我们开口大声说出来吧！",
      tips: [
        "1. Hello 是最通用的招呼语，任何时候都可以用哦。",
        "2. Good morning 专门用来跟早上的老师、同学问好。",
        "3. 告别的时候，别忘了甜甜地说一声 Goodbye!"
      ],
      words: [
        { word: "hello", phonetic: "[hə'ləʊ]", translation: "你好" },
        { word: "morning", phonetic: "['mɔːnɪŋ]", translation: "上午；早上" },
        { word: "goodbye", phonetic: "[ˌɡʊd'baɪ]", translation: "再见" },
        { word: "how", phonetic: "[haʊ]", translation: "怎样；如何" }
      ],
      sentences: [
        { english: "Good morning.", chinese: "早上好。" },
        { english: "Hello, I am Danny.", chinese: "你好，我是丹尼。" },
        { english: "How are you?", chinese: "你好吗？" }
      ]
    },
    {
      unit: "Unit 2",
      title: "My classroom",
      text: "句型：School Things (教室用品)\n认识我们在学校里每天都会用到的学习小帮手！学习使用 'This is...' 来介绍我们心爱的书包、铅笔和画笔。",
      tips: [
        "1. This is my... 表示“这是我的...”，指离自己很近的东西噢。",
        "2. 别拿错 pencil (铅笔) 和 rubber (橡皮)，它们是一对好朋友！"
      ],
      words: [
        { word: "book", phonetic: "[bʊk]", translation: "书" },
        { word: "ruler", phonetic: "['ruːlə]", translation: "尺子" },
        { word: "pencil", phonetic: "['pens(ɪ)l]", translation: "铅笔" },
        { word: "rubber", phonetic: "['rʌbə]", translation: "橡皮擦" }
      ],
      sentences: [
        { english: "This is my book.", chinese: "这是我的书。" },
        { english: "Show me your ruler.", chinese: "给我看看你的尺子。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "My face",
      text: "句型：My Face (我的五官)\n介绍和指出我们脸部的五官：eye (眼睛)、ear (耳朵)、nose (鼻子) 和 mouth (嘴巴)，还可以配上一只可爱的互动游戏：Touch your...",
      tips: [
        "1. Touch your nose. 是指“摸摸你的鼻子”，可以用它和爸爸妈妈互动玩游戏哦。",
        "2. 注意 mouth 开头的发音，舌尖要轻轻咬一咬。"
      ],
      words: [
        { word: "eye", phonetic: "[aɪ]", translation: "眼睛" },
        { word: "ear", phonetic: "[ɪə]", translation: "耳朵" },
        { word: "nose", phonetic: "[nəʊz]", translation: "鼻子" },
        { word: "mouth", phonetic: "[maʊθ]", translation: "嘴巴" }
      ],
      sentences: [
        { english: "Touch your nose.", chinese: "摸摸你的鼻子。" },
        { english: "This is my mouth.", chinese: "这是我的嘴巴。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Animals",
      text: "句型：Lovely Animals (可爱的小动物)\n小动物是人类最好的朋友！认识可爱的 dog, cat, bird, rabbit，学会用句子 'I like...' 来表达对它们纯纯的喜爱吧。",
      tips: [
        "1. 复数形式可在小动物后面加 s，比如 I like dogs. 意思是我喜欢狗（这一类动物）。",
        "2. Rabbit (兔子) 跑得飞快，长耳朵特别软！"
      ],
      words: [
        { word: "dog", phonetic: "[dɒɡ]", translation: "狗" },
        { word: "cat", phonetic: "[kæt]", translation: "猫" },
        { word: "bird", phonetic: "[bɜːd]", translation: "鸟" },
        { word: "rabbit", phonetic: "['ræbɪt]", translation: "兔子" }
      ],
      sentences: [
        { english: "I like dogs.", chinese: "我喜欢狗。" },
        { english: "Look at the rabbit.", chinese: "看着那只兔子。" }
      ]
    }
  ],
  grade_1b: [
    {
      unit: "Unit 1",
      title: "My classroom",
      text: "句型：Classroom Actions (教室指令)\n学会听懂老师在课堂上的精彩指令！听懂 door, window, board, light，然后跟上动作，做个快乐的英语小达人。",
      tips: [
        "1. Open 表示打开，Close 表示关上。比如 Open the door. 或者是 Close the window.",
        "2. Clean the board! 保持我们漂亮的黑板干净，人人有责！"
      ],
      words: [
        { word: "door", phonetic: "[dɔː]", translation: "门" },
        { word: "window", phonetic: "['wɪndəʊ]", translation: "窗户" },
        { word: "board", phonetic: "[bɔːd]", translation: "黑板" },
        { word: "light", phonetic: "[laɪt]", translation: "灯" }
      ],
      sentences: [
        { english: "Open the door.", chinese: "开门。" },
        { english: "Clean the board.", chinese: "擦黑板。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "My family",
      text: "句型：Family Members (家庭成员)\n家庭是我们温暖的港湾。让我们学习甜甜地叫出 father, mother, brother, sister，并学会用 'This is my...' 把家人自豪地介绍给同学和老师。",
      tips: [
        "1. He and She 有区别：男生的“他”用 He，女生的“她”用 She。比如 He is my father. She is my mother.",
        "2. Brother 代表哥哥或弟弟，Sister 代表姐姐或妹妹。"
      ],
      words: [
        { word: "father", phonetic: "['fɑːðə]", translation: "父亲；爸爸" },
        { word: "mother", phonetic: "['mʌðə]", translation: "母亲；妈妈" },
        { word: "brother", phonetic: "['brʌðə]", translation: "兄弟" },
        { word: "sister", phonetic: "['sɪstə]", translation: "姐妹" }
      ],
      sentences: [
        { english: "Who is he?", chinese: "他是谁？" },
        { english: "This is my mother.", chinese: "这是我的妈妈。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "My body",
      text: "句型：Body Movements (身体运动)\n动起来，动起来！认识我们的 hand, arm, leg, foot，并跟着欢快的节奏活动：Wave your hand, Touch your leg! 让身体棒棒哒。",
      tips: [
        "1. Foot (一只脚) 的复数形式是 feet (两只脚)，可不是加 s 喔！",
        "2. Wave your hand. 意为挥挥手。多伸展身体更健康！"
      ],
      words: [
        { word: "hand", phonetic: "[hænd]", translation: "手" },
        { word: "arm", phonetic: "[ɑːm]", translation: "手臂" },
        { word: "leg", phonetic: "[leɡ]", translation: "腿" },
        { word: "foot", phonetic: "[fʊt]", translation: "脚" }
      ],
      sentences: [
        { english: "Wave your hand.", chinese: "挥挥你的手。" },
        { english: "Touch your leg.", chinese: "摸摸你的腿。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Food and drink",
      text: "句型：Fruit & Drink (食物与饮料)\n好吃的苹果、好喝的牛奶！掌握 apple, banana, milk, water，并能邀请别人：Have an apple. 主动分享能交到更多好朋友呦！",
      tips: [
        "1. Apple 开头是元音发音，所以用 'an apple'，其他的香蕉用 'a banana'。元音辅音要区分。",
        "2. Milk 和 Water 是不可数名词，不能直接在后面加 s 喔。"
      ],
      words: [
        { word: "apple", phonetic: "['æp(ə)l]", translation: "苹果" },
        { word: "banana", phonetic: "[bə'nɑːnə]", translation: "香蕉" },
        { word: "milk", phonetic: "[mɪlk]", translation: "牛奶" },
        { word: "water", phonetic: "['wɔːtə]", translation: "水" }
      ],
      sentences: [
        { english: "I like milk.", chinese: "我喜欢牛奶。" },
        { english: "Have an apple.", chinese: "吃个苹果吧。" }
      ]
    }
  ],
  grade_2a: [
    {
      unit: "Unit 1",
      title: "Friends",
      text: "句型：Who is my friend? (我的朋友物语)\n在全新的二年级，我们认识了更多的小男孩(boy)和女孩子(girl)！学会描写我们的小同伴（例如 He is my friend. She is tall...）。",
      tips: [
        "1. Friend 意思是朋友。快和身边的小盆友交换微笑，成为 friend 吧！",
        "2. Tall 意思是高，它的反义词是 short (矮)。"
      ],
      words: [
        { word: "boy", phonetic: "[bɔɪ]", translation: "男孩" },
        { word: "girl", phonetic: "[ɡɜːl]", translation: "女孩" },
        { word: "friend", phonetic: "[frend]", translation: "朋友" },
        { word: "tall", phonetic: "[tɔːl]", translation: "高的" }
      ],
      sentences: [
        { english: "He is my friend.", chinese: "他是我的朋友。" },
        { english: "She is a tall girl.", chinese: "她是一个高个子女孩。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "My family",
      text: "句型：Generations (祖孙三代)\n学习爷爷奶奶(grandfather, grandmother)以及小伙伴表亲(cousin)的英语表达。体会家庭之中的无限爱意(love)！",
      tips: [
        "1. Grandfather 也可以亲切地叫 Grandpa，Grandmother 叫 Grandma。",
        "2. Cousin 指的是堂兄弟姐妹或者表兄弟姐妹，只要不是亲生的兄弟姐妹，都可以叫 cousin 呢。"
      ],
      words: [
        { word: "grandfather", phonetic: "['ɡrænd_fɑːðə]", translation: "祖父；外祖父" },
        { word: "grandmother", phonetic: "['ɡrænd_mʌðə]", translation: "祖母；外祖母" },
        { word: "cousin", phonetic: "['kʌz(ə)n]", translation: "表兄弟；堂姐妹" },
        { word: "love", phonetic: "[lʌv]", translation: "爱" }
      ],
      sentences: [
        { english: "I love my family.", chinese: "我爱我的家人。" },
        { english: "He is my grandfather.", chinese: "他是我的爷爷/外公。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Things I like to do",
      text: "句型：I can do (我可以做)\n我们的课后生活真是太丰富啦！有人喜欢跑(run)，有人可以跳高(jump)，也有人天生就是金嗓小百灵喜欢唱(sing)和跳舞(dance)。",
      tips: [
        "1. Can 表示“能够/可以”。句子 I can run! 意思是“我可以跑步”。",
        "2. I like to ... 表示“我喜欢做...”。比如 I like to dance. 我喜欢跳舞。"
      ],
      words: [
        { word: "run", phonetic: "[rʌn]", translation: "奔跑" },
        { word: "jump", phonetic: "[dʒʌmp]", translation: "跳跃" },
        { word: "sing", phonetic: "[sɪŋ]", translation: "唱歌" },
        { word: "dance", phonetic: "[dɑːns]", translation: "跳舞" }
      ],
      sentences: [
        { english: "I can run.", chinese: "我会跑。" },
        { english: "I like to dance.", chinese: "我喜欢跳舞。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Forest animals",
      text: "句型：Forest Explorers (森林居民)\n走进茂密的森林，去探访威武的森林动物！学习大狗熊(bear)、聪明的狐狸(fox)、百兽之王狮子(lion)和威武的老虎(tiger)。",
      tips: [
        "1. Do you like...? “你喜欢...吗？” 提问后对方可以用 Yes, I do. 或 No, I don't. 来回答嗷。",
        "2. Lion 开头有 l 的鼻音，读起来非常有力量！"
      ],
      words: [
        { word: "bear", phonetic: "[beə]", translation: "熊" },
        { word: "fox", phonetic: "[fɒks]", translation: "狐狸" },
        { word: "lion", phonetic: "['laɪən]", translation: "狮子" },
        { word: "tiger", phonetic: "['taɪɡə]", translation: "老虎" }
      ],
      sentences: [
        { english: "Do you like lions?", chinese: "你喜欢狮子吗？" },
        { english: "The bear is big.", chinese: "这只熊特别大。" }
      ]
    }
  ],
  grade_2b: [
    {
      unit: "Unit 1",
      title: "Activities",
      text: "句型：Can you...? (日常看家本领)\n让我们学习挑战自我，去碧海中游泳(swim)，或者像鸟儿一样在天空中飞翔(fly)！或者是拿起小画笔涂涂画画(paint & draw)。",
      tips: [
        "1. Paint 是指用油漆或水彩上色，而 Draw 指的是用铅笔、钢笔在纸上画线条，不一样哦！",
        "2. Can you... 提问“你会做...吗？”。例如 Can you swim? 你会游泳吗？"
      ],
      words: [
        { word: "swim", phonetic: "[swɪm]", translation: "游泳" },
        { word: "fly", phonetic: "[flaɪ]", translation: "飞翔" },
        { word: "paint", phonetic: "[peɪnt]", translation: "涂色；绘画" },
        { word: "draw", phonetic: "[drɔː]", translation: "画图；素描" }
      ],
      sentences: [
        { english: "Can you swim?", chinese: "你会游泳吗？" },
        { english: "Yes, I can fly a kite.", chinese: "是的，我会放风筝。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "My favorite food",
      text: "句型：Delicious Food (美味厨房)\n哇！香喷喷的披萨(pizza)、脆脆的小饼干(biscuit)，健康美味的沙律(salad)和一碗热腾腾的汤(soup)。哪一个才是你的最爱？",
      tips: [
        "1. What do you like to eat? “你想吃点什么？” 这句是西餐厅的高频词句哦。",
        "2. Soup 是汤，注意辅音 p 要轻声呼出来。"
      ],
      words: [
        { word: "pizza", phonetic: "['piːtsə]", translation: "比萨饼" },
        { word: "biscuit", phonetic: "['bɪskɪt]", translation: "饼干" },
        { word: "salad", phonetic: "['sæləd]", translation: "沙拉" },
        { word: "soup", phonetic: "[suːp]", translation: "汤" }
      ],
      sentences: [
        { english: "What do you like to eat?", chinese: "你喜欢吃什么？" },
        { english: "I like pizza.", chinese: "我喜欢吃比萨。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Things around us",
      text: "句型：Vehicles (马路上的交通工具)\n走上街头，红绿灯下跑着各式各样的车子：帅气的小骄车(car)、高大载客多多的公交车(bus)、轻盈环保的自行车(bicycle)，还有轨道上哐当哐当的长火车(train)！",
      tips: [
        "1. Bus 的复数是 buses，要加上 es 哦！",
        "2. Train 也可以指“训练”，看句子意思来分辨吧。"
      ],
      words: [
        { word: "car", phonetic: "[kɑː]", translation: "汽车" },
        { word: "bus", phonetic: "[bʌs]", translation: "公交车" },
        { word: "bicycle", phonetic: "['baɪsɪk(ə)l]", translation: "自行车" },
        { word: "train", phonetic: "[treɪn]", translation: "火车" }
      ],
      sentences: [
        { english: "Look at the train.", chinese: "看那列大火车。" },
        { english: "I have a new bicycle.", chinese: "我有一辆新自行车。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Seasons",
      text: "句型：Seasons Change (四季轮换)\n大自然真是太神奇啦，一年四季各有各的美。温暖的春天(spring)、炎热的夏天(summer)、金色的秋天(autumn)，还有白雪皑皑的冬天(winter)。",
      tips: [
        "1. 每一个季节都可以配上它的专属颜色。比如 Spring is green. Summer is red. Autumn is yellow. Winter is white.",
        "2. Autumn 在美式英语常常叫做 Fall。"
      ],
      words: [
        { word: "spring", phonetic: "[sprɪŋ]", translation: "春天" },
        { word: "summer", phonetic: "['sʌmə]", translation: "夏天" },
        { word: "autumn", phonetic: "['ɔːtəm]", translation: "秋天" },
        { word: "winter", phonetic: "['wɪntə]", translation: "冬天" }
      ],
      sentences: [
        { english: "I like summer.", chinese: "我喜欢夏天。" },
        { english: "Spring is green.", chinese: "春天是绿绿的。" }
      ]
    }
  ],
  grade_3a: [
    {
      unit: "Unit 1",
      title: "My school",
      text: "句型：School Life (快乐学校)\n三年级的我们已经是小哥哥小姐姐啦！宽阔的操场(playground)、藏满智慧的图书角(library)、大大的教室(classroom)，每个角落都充满快乐。",
      tips: [
        "1. Let's go to the... 表示“让我们去...吧”。我们可以在这里写去图书馆(library)。",
        "2. Play 加上 ground 就是操场，真是个用来开怀玩耍的好地方！"
      ],
      words: [
        { word: "classroom", phonetic: "['klɑːsruːm]", translation: "教室" },
        { word: "playground", phonetic: "['pleɪɡraʊnd]", translation: "操场" },
        { word: "library", phonetic: "['laɪbrərɪ]", translation: "图书馆" },
        { word: "toilet", phonetic: "['tɔɪlət]", translation: "厕所；盥洗室" }
      ],
      sentences: [
        { english: "Let's go to the library.", chinese: "咱们去图书馆吧。" },
        { english: "Our classroom is big.", chinese: "我们的教室非常宽敞。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "My friends",
      text: "句型：Adjectives of Look (描写外貌特点)\n大家虽然外貌各异，但都是最棒的好朋友。学习用 fat(胖)、thin(瘦)、strong(强壮) 和 weak(弱) 来生动得描绘人物形象吧！",
      tips: [
        "1. Strong 反义词是 weak，Fat 反义词是 thin。对比记忆更高效！",
        "2. 描述他人长相时，要保持尊重，多夸别人 strong 噢！"
      ],
      words: [
        { word: "fat", phonetic: "[fæt]", translation: "胖的" },
        { word: "thin", phonetic: "[θɪn]", translation: "瘦的" },
        { word: "strong", phonetic: "[strɒŋ]", translation: "强壮的" },
        { word: "weak", phonetic: "[wiːk]", translation: "虚弱的" }
      ],
      sentences: [
        { english: "Danny is fat.", chinese: "丹尼胖乎乎的。" },
        { english: "He is strong.", chinese: "他非常强壮。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Plants",
      text: "句型：Nature Plants (美丽的植物园)\n草坪郁郁葱葱，花朵色彩斑斓。掌握大树(tree)、鲜花(flower)、青草(grass) 和绿叶(leaf) 的名字，用心呵护我们的绿色地球吧！",
      tips: [
        "1. Leaf 的复数非常奇特，要把 f 变成 v 再加 es，全称是 leaves 噢。",
        "2. Grass 代表草地上成片的生命，通常也是不可数的呢。"
      ],
      words: [
        { word: "tree", phonetic: "[triː]", translation: "树木" },
        { word: "flower", phonetic: "['flaʊə]", translation: "花朵" },
        { word: "grass", phonetic: "[ɡrɑːs]", translation: "草；草地" },
        { word: "leaf", phonetic: "[liːf]", translation: "树叶" }
      ],
      sentences: [
        { english: "The flower is red.", chinese: "这朵花红彤彤的。" },
        { english: "Look at the big tree.", chinese: "瞧那棵大树。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Insects",
      text: "句型：Small Bugs (草丛里的微观世界)\n在春日的小池塘边，小蝴蝶(butterfly)飞飞、小蜜蜂(bee)采蜜忙、小瓢虫(ladybird)睡觉觉，而勤劳的小蚂蚁(ant)在努力搬家。",
      tips: [
        "1. Ladybird 在美式英语常被称为 Ladybug。它代表幸运呢！",
        "2. Butterfly 特别好看，由 butter(黄油) 和 fly(飞) 组成，特别好记。"
      ],
      words: [
        { word: "bee", phonetic: "[biː]", translation: "蜜蜂" },
        { word: "butterfly", phonetic: "['bʌtəflaɪ]", translation: "蝴蝶" },
        { word: "ladybird", phonetic: "['leɪdɪbɜːd]", translation: "瓢虫" },
        { word: "ant", phonetic: "[ænt]", translation: "蚂蚁" }
      ],
      sentences: [
        { english: "I see a butterfly.", chinese: "我看见了一只漂亮的蝴蝶。" },
        { english: "Do bees like honey?", chinese: "蜜蜂喜欢蜂蜜吗？" }
      ]
    }
  ],
  grade_3b: [
    {
      unit: "Unit 1",
      title: "Colours",
      text: "句型：What colour...? (奇幻色彩斑斓)\n天是蓝的(blue)，太阳是耀眼的黄的(yellow)，森林是翠绿的(green)，苹果是火红的(red)。快用英语画出一道绚丽彩虹吧！",
      tips: [
        "1. What colour is...? 用来向别人提问“这是什么颜色的？”。",
        "2. Colours 在英式拼写有 u，在美式拼写是 colors 喔。"
      ],
      words: [
        { word: "red", phonetic: "[red]", translation: "红色的" },
        { word: "blue", phonetic: "[bluː]", translation: "蓝色的" },
        { word: "yellow", phonetic: "['jeləʊ]", translation: "黄色的" },
        { word: "green", phonetic: "[ɡriː]", translation: "绿色的" }
      ],
      sentences: [
        { english: "What colour is the sky?", chinese: "天空是什么颜色？" },
        { english: "It is blue.", chinese: "是蔚蓝色的。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "Clothing",
      text: "句型：Wear Clothes (穿衣打扮)\n穿上帅气的衬衫(shirt)、漂亮的小短裙(skirt)、华美的连身裙(dress)和帅气的长裤(trousers)。今天你是个干净得体的小绅士/小淑女！",
      tips: [
        "1. Trousers 裤子有两个裤脚，必须用复数，且谓语要搭配复数词哦（如 These trousers are new.）。",
        "2. Skirt 和 Dress 有区别，skirt 是半身裙，dress 是上下连一起整套的连身裙。"
      ],
      words: [
        { word: "shirt", phonetic: "[ʃɜːt]", translation: "男式衬衫" },
        { word: "skirt", phonetic: "[skɜːt]", translation: "半身裙" },
        { word: "dress", phonetic: "[dres]", translation: "连衣裙" },
        { word: "trousers", phonetic: "['traʊzəz]", translation: "裤子" }
      ],
      sentences: [
        { english: "I like your new dress.", chinese: "我喜欢你的新毛衣裙/连身裙。" },
        { english: "This shirt is clean.", chinese: "这件衬衫很干净。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Weather",
      text: "句型：Seasons & Cloud (外面的天气晴好)\n不管下雨天(rainy)、刮风天(windy)、多云天(cloudy)还是晴空万里的好天气(sunny)。都是最完美、最能陪伴我们快乐成长的一天！",
      tips: [
        "1. 天气形容词大多是在名词(sun, wind, rain, cloud)后边加上 y。注意 sun 要双写 n 变成 sunny 噢。",
        "2. It is ... today. 表示“今天天气是...”。比如 It is sunny today."
      ],
      words: [
        { word: "sunny", phonetic: "['sʌnɪ]", translation: "晴朗的" },
        { word: "cloudy", phonetic: "['klaʊdɪ]", translation: "多云的" },
        { word: "rainy", phonetic: "['reɪnɪ]", translation: "阴雨的" },
        { word: "windy", phonetic: "['wɪndɪ]", translation: "刮风的" }
      ],
      sentences: [
        { english: "It is rainy today.", chinese: "今天下雨了。" },
        { english: "I like sunny days.", chinese: "我喜欢晴天。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Time",
      text: "句型：Tick-Tock Clock (点点滴滴时间)\n嘀嗒嘀嗒！学会向他人询问当前的时间(time)。认识几点整(o'clock)，从小养成作息规律，做一个守时、守约的好宝贝吧！",
      tips: [
        "1. What time is it? 提问现在几点了。回答可以说 It's eight o'clock.",
        "2. o'clock 全称是 of the clock，缩写成这样表示正点，整点哦。"
      ],
      words: [
        { word: "o'clock", phonetic: "[ə'klɒk]", translation: "……点钟" },
        { word: "time", phonetic: "[taɪm]", translation: "时间" },
        { word: "morning", phonetic: "['mɔːnɪŋ]", translation: "早晨" },
        { word: "night", phonetic: "[naɪt]", translation: "夜晚" }
      ],
      sentences: [
        { english: "What time is it?", chinese: "现在几点了？" },
        { english: "It's seven o'clock.", chinese: "现在是早上七点钟。" }
      ]
    }
  ],
  grade_4a: [
    {
      unit: "Unit 1",
      title: "Sports",
      text: "句型：Love Sports (强身健体打球忙)\n生命的活力在于运动！和好朋友们下课之后，去球场挥洒汗水打篮球(basketball)、踢足球(football)、打国球乒乓(table tennis)或者羽毛球(badminton)吧！",
      tips: [
        "1. 英语中玩所有球类，直接用 play 加上球类名字。不用加 'the' 哦！比如 play football.",
        "2. Table tennis 也叫 ping-pong，简直就是拟声词的完美体现。"
      ],
      words: [
        { word: "football", phonetic: "['fʊtbɔːl]", translation: "足球" },
        { word: "basketball", phonetic: "['bɑːskɪtbɔːl]", translation: "篮球" },
        { word: "table tennis", phonetic: "[ˌteɪb(ə)l 'tenɪs]", translation: "乒乓球" },
        { word: "badminton", phonetic: "['bædmɪntən]", translation: "羽毛球" }
      ],
      sentences: [
        { english: "Let's play football.", chinese: "我们去踢足球吧。" },
        { english: "He is good at basketball.", chinese: "他特别擅长打篮球。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "Jobs",
      text: "句型：Occupations (长大后的小梦想)\n长大后你梦想成为一个什么样的人？是救死扶伤的医生(doctor)、温柔细致的护士(nurse)、悉心教学的老师(teacher)还是英勇救火的消防员(fireman)？",
      tips: [
        "1. What do you want to be? 意思是“你想当一个什么职业呀？”。",
        "2. Fireman 由 fire 与 man 拼写而成，多好记呀！"
      ],
      words: [
        { word: "doctor", phonetic: "['dɒktə]", translation: "医生" },
        { word: "nurse", phonetic: "[nɜːs]", translation: "护士" },
        { word: "teacher", phonetic: "['tiːtʃə]", translation: "老师" },
        { word: "fireman", phonetic: "['faɪəmən]", translation: "消防员" }
      ],
      sentences: [
        { english: "What do you want to be?", chinese: "你长大后想做什么？" },
        { english: "I want to be a pilot.", chinese: "我想当一名飞行员。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Places",
      text: "句型：City Places (我们所在的魅力都市)\n在美丽的上海，生活是如此方便。这里有大大的超市(supermarket)、充满欢呼和神奇动物的动物园(zoo)、散步看花的花园(park)和各式商店(shop)！",
      tips: [
        "1. Supermarket = Super (超级) + Market (市场/菜场)，合起来就是超市！",
        "2. Let's go to the zoo. 看大熊猫和长颈鹿去咯！"
      ],
      words: [
        { word: "zoo", phonetic: "[zuː]", translation: "动物园" },
        { word: "park", phonetic: "[pɑːk]", translation: "公园" },
        { word: "shop", phonetic: "[ʃɒp]", translation: "商店" },
        { word: "supermarket", phonetic: "['suːpəˌmɑːkɪt]", translation: "超级市场" }
      ],
      sentences: [
        { english: "Let's go to the zoo.", chinese: "让我们去动物园玩吧。" },
        { english: "We can buy fruit in the supermarket.", chinese: "我们能在超市买到新鲜水果。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Home",
      text: "句型：My House (温馨小家里)\n家是我们生活最舒服的地方。客厅里看电视聊天(living room)、厨房里做出美味大餐(kitchen)、浴室里洗个热水澡(bathroom)然后在舒适卧室里美美入睡(bedroom)。",
      tips: [
        "1. Living room 代表客厅，注意 living 两个一轻一重的 i 拼写发音哦。",
        "2. Kitchen 里面有 ch 发 音 ['tʃ] 像是油炸的嗞嗞声，特别生动好记。"
      ],
      words: [
        { word: "bedroom", phonetic: "['bedruːm]", translation: "卧室" },
        { word: "living room", phonetic: "['lɪvɪŋ ruːm]", translation: "客厅" },
        { word: "kitchen", phonetic: "['kɪtʃɪn]", translation: "厨房" },
        { word: "bathroom", phonetic: "['bɑːθruːm]", translation: "浴室" }
      ],
      sentences: [
        { english: "My bedroom is cozy.", chinese: "我的卧室特别温馨舒服。" },
        { english: "The kitchen is clean.", chinese: "厨房被打扫得很干净。" }
      ]
    }
  ],
  grade_4b: [
    {
      unit: "Unit 1",
      title: "Subjects",
      text: "句型：Interesting School Subjects (我最喜欢的功课)\n学校每门功课都有它独特的乐趣！有美妙旋律的音乐、考验逻辑的数学(Maths)、领略大自然的科学(Science)以及拓展视野和拼写的英语课(English)！",
      tips: [
        "1. 科目的英文拼写首字母一定要大写哦！比如 English, Maths, Chinese.",
        "2. Maths 后面有 s，在美式英语拼写中常常是 Math，两个都完全对哦。"
      ],
      words: [
        { word: "English", phonetic: "['ɪŋɡlɪʃ]", translation: "英语" },
        { word: "Chinese", phonetic: "[ˌtʃaɪ'niːz]", translation: "语文；汉语" },
        { word: "Maths", phonetic: "[mæθs]", translation: "数学" },
        { word: "Science", phonetic: "['saɪəns]", translation: "科学" }
      ],
      sentences: [
        { english: "What subjects do you like?", chinese: "你最喜欢什么学科？" },
        { english: "I like Maths.", chinese: "我比较喜欢数学课。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "School trips",
      text: "句型：Go out (校外游学日)\n最盼望着跟着学校的大巴车去秋游游学啦！去博物馆探索古代恐龙(museum)、去金灿灿的沙滩沐浴海风(beach)、去农场做小小插秧家(farm)甚至去电影院大开眼界(cinema)！",
      tips: [
        "1. Cinema 是电影院，英美国家很多人也说 movie theater.",
        "2. Beach 旁边是美丽的海洋，享受沙子在脚趾缝穿过的感觉吧！"
      ],
      words: [
        { word: "museum", phonetic: "[mjuː'ziːəm]", translation: "博物馆" },
        { word: "beach", phonetic: "[biːtʃ]", translation: "沙滩" },
        { word: "farm", phonetic: "[fɑːm]", translation: "农场" },
        { word: "cinema", phonetic: "['sɪnəmə]", translation: "电影院" }
      ],
      sentences: [
        { english: "We visited a farm.", chinese: "我们参观了一家农场。" },
        { english: "I want to go to the cinema.", chinese: "我想去看场电影。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Music",
      text: "句型：Musical Instruments (浪漫乐器大合奏)\n各种美妙的乐音在我们耳边响起：优雅大方的钢琴(piano)、优美细腻的小提琴(violin)、极具摇滚色彩的吉他(guitar)和节奏感爆炸的响鼓(drum)！",
      tips: [
        "1. 弹奏乐器一定要在前面加 article 'the' 哦！比如 play the piano, play the violin.",
        "2. Piano 的复数是 pianos（直接加 s就行，不用加 es 喔）。"
      ],
      words: [
        { word: "piano", phonetic: "[pɪ'ænəʊ]", translation: "钢琴" },
        { word: "violin", phonetic: "[ˌvaɪə'lɪn]", translation: "小提琴" },
        { word: "guitar", phonetic: "[ɡɪ'tɑː]", translation: "吉他" },
        { word: "drum", phonetic: "[drʌm]", translation: "鼓" }
      ],
      sentences: [
        { english: "Can you play the piano?", chinese: "你会弹钢琴吗？" },
        { english: "She plays the violin.", chinese: "她正拉小提琴拉得起劲。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Festivities",
      text: "句型：Merry Days (快乐的节日)\n圣诞挂满彩灯(Christmas)、复活节彩蛋藏起来(Easter)、元旦烟火秀欢呼(New Year)，还有每年最期待的、属于你一个人的生日盛宴(birthday)！",
      tips: [
        "1. Merry Christmas! 是西方国家最热烈的圣诞节打招呼口红语。",
        "2. Christmas 和 Easter 的首字母也要务必大写哦。"
      ],
      words: [
        { word: "Christmas", phonetic: "['krɪsməs]", translation: "圣诞节" },
        { word: "Easter", phonetic: "['iːstə]", translation: "复活节" },
        { word: "New Year", phonetic: "[ˌnjuː 'jɪə]", translation: "新年" },
        { word: "birthday", phonetic: "['bɜːθdeɪ]", translation: "生日" }
      ],
      sentences: [
        { english: "Merry Christmas!", chinese: "圣诞快乐！" },
        { english: "Happy birthday to you!", chinese: "祝你生日快乐！" }
      ]
    }
  ],
  grade_5a: [
    {
      unit: "Unit 1",
      title: "Grandfriends",
      text: "句型：Grandparents (长辈尊亲与探望)\n爷爷、奶奶、外公、外婆(grandfather, grandmother)陪伴我们长大，我们应该经常去探望(visit)并陪伴他们。家有一老，如有一宝！",
      tips: [
        "1. Often 表示“经常”。是一个非常好用的时间频度词汇。",
        "2. Visit 既可以当做做客，也可以当做去医院/医院检查（比如 visit the dentist 拜访牙医）。"
      ],
      words: [
        { word: "grandfather", phonetic: "['ɡrændˌfɑːðə]", translation: "爷爷；外公" },
        { word: "grandmother", phonetic: "['ɡrændˌmʌðə]", translation: "奶奶；外婆" },
        { word: "visit", phonetic: "['vɪzɪt]", translation: "拜访；看望" },
        { word: "often", phonetic: "['ɒf(ə)n]", translation: "经常" }
      ],
      sentences: [
        { english: "I often visit my grandmother.", chinese: "我经常去拜访看望奶奶。" },
        { english: "We love them.", chinese: "我们非常爱他/她们。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "Feeling",
      text: "句型：Emotions (今天的小心情如何？)\n生活五彩斑斓，我们的心情也有起落。考了满分很高兴(happy)、洋娃娃丢了很伤心(sad)、玩具枪坏了有点生气(angry)、跑了一万米感到精疲力竭(tired)。都是最真实的心灵写照！",
      tips: [
        "1. Empathy：关心同学和朋友感情时，可以温柔问一句 'Why are you sad?'。",
        "2. Feel 是个连系动词，后面可以直接接形容词。比如 I feel happy. 感觉很快乐！"
      ],
      words: [
        { word: "happy", phonetic: "['hæpɪ]", translation: "快乐的；幸福的" },
        { word: "sad", phonetic: "[sæd]", translation: "悲伤的；难过的" },
        { word: "angry", phonetic: "['æŋɡrɪ]", translation: "生气的" },
        { word: "tired", phonetic: "['taɪəd]", translation: "疲倦的；劳累的" }
      ],
      sentences: [
        { english: "Why are you sad?", chinese: "你为什么这么苦恼/难过？" },
        { english: "I feel tired.", chinese: "我感觉真有点累了。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "Future plans",
      text: "句型：Be going to (未来的辉煌梦想)\n随着我们一天天成长(grow)，我们可以建造宏伟的房子和事业(build)、可以到遥远的未知远方旅行(travel)，拥抱广阔又精彩的地球世界(world)！",
      tips: [
        "1. Will + 动词原形表示将会做某事。将来时十分重要哦！",
        "2. Travel around the world 表示环游世界，简直太酷炫了！"
      ],
      words: [
        { word: "grow", phonetic: "[ɡrəʊ]", translation: "生长；成长" },
        { word: "build", phonetic: "[bɪld]", translation: "建造" },
        { word: "travel", phonetic: "['træv(ə)l]", translation: "旅行；游历" },
        { word: "world", phonetic: "[wɜːld]", translation: "世界；地球" }
      ],
      sentences: [
        { english: "What are you going to do?", chinese: "你计划要做什么？" },
        { english: "I will travel around the world.", chinese: "我将来要去环游世界。" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Daily life",
      text: "句型：Daily Routine (元气满满的时间管理者)\n早睡早起身体好！每天早早醒来(wake up)、用温水洗脸刷牙(wash)、吃上妈妈亲手做的温馨早餐(breakfast)，然后快乐奔赴学校(school)！",
      tips: [
        "1. Wake up 专门指的是睡眼惺忪睁开眼醒过来，而 Get up 是穿衣起床脚着地，稍微有差别哦。",
        "2. Breakfast 的前缀 break(打破) + fast(斋戒)，代表打破昨晚的长眠空腹，要吃得饱饱的！"
      ],
      words: [
        { word: "wake up", phonetic: "[weɪk ʌp]", translation: "醒来" },
        { word: "wash", phonetic: "[wɒʃ]", translation: "洗" },
        { word: "breakfast", phonetic: "['brekfəst]", translation: "早餐" },
        { word: "school", phonetic: "[skuːl]", translation: "学校" }
      ],
      sentences: [
        { english: "I wake up at six.", chinese: "我每天早上六点中睁开眼醒来。" },
        { english: "I have breakfast at seven.", chinese: "我每天在七点吃早餐。" }
      ]
    }
  ],
  grade_5b: [
    {
      unit: "Unit 1",
      title: "Holidays",
      text: "句型：Past Experiences (黄金假日探险)\n假期(holiday)去哪里游玩了？去崇明岛爬高山(climb mountain)看美景，还是去三亚的海滩看波澜壮阔的大海(sea)？分享你的故事！",
      tips: [
        "1. 谈起过去的经历，我们要在动词用过去式噢。比如 go 变成 went，visit 变成 visited。",
        "2. Mountain 在拼写时，注意 '-tain' 的两个元音字母 a 和 i，不要漏掉哦。"
      ],
      words: [
        { word: "holiday", phonetic: "['hɒlədeɪ]", translation: "假期" },
        { word: "climb", phonetic: "[klaɪm]", translation: "攀爬" },
        { word: "mountain", phonetic: "['maʊntɪn]", translation: "高山" },
        { word: "sea", phonetic: "[siː]", translation: "大海；海洋" }
      ],
      sentences: [
        { english: "Where did you go for the holiday?", chinese: "你假期去哪里玩了？" },
        { english: "I went to Sanya.", chinese: "我去了三亚。" }
      ]
    },
    {
      unit: "Unit 2",
      title: "Buying things",
      text: "句型：A Shop assistant (去百货商店买买买)\n在超市和文具馆里，学会询问价格(how much)！买下喜欢的心爱之物(buy)。学会计算人民币单位(yuan)或英国便士、英镑(pound)。",
      tips: [
        "1. How much is...? 用于询问单数物品的价格。比如 How much is this ruler?",
        "2. Yuan（元）是人民币，拼音和英文拼写一模一样，特别亲切吧。"
      ],
      words: [
        { word: "buy", phonetic: "[baɪ]", translation: "买；购买" },
        { word: "how much", phonetic: "[haʊ mʌtʃ]", translation: "多少钱" },
        { word: "pound", phonetic: "[paʊnd]", translation: "英镑" },
        { word: "yuan", phonetic: "[jʊ'æn]", translation: "元(人民币)" }
      ],
      sentences: [
        { english: "How much is this book?", chinese: "这本书多少钱？" },
        { english: "It is twenty yuan.", chinese: "二十元钱。" }
      ]
    },
    {
      unit: "Unit 3",
      title: "School activities",
      text: "句型：Winners show (学校精彩科技节)\n我们在学校的戏剧舞台和科技节(sport & project)大放异彩！大家团结一致去展现(show)我们的智慧与风采，最终赢取了大奖杯(win)！",
      tips: [
        "1. Win 过去式是 won。That's amazing! 表扬同学时一定要神采饱满。",
        "2. Project 表示项目，也可以指学校的小课题、小组手工作业。"
      ],
      words: [
        { word: "sport", phonetic: "[spɔːt]", translation: "体育运动" },
        { word: "project", phonetic: "['prɒdʒekt]", translation: "项目；课题" },
        { word: "show", phonetic: "[ʃəʊ]", translation: "展示；演出" },
        { word: "win", phonetic: "[wɪn]", translation: "赢；获胜" }
      ],
      sentences: [
        { english: "Our project won the prize.", chinese: "我们的研究项目获奖了。" },
        { english: "That was amazing.", chinese: "那简直太神妙了！" }
      ]
    },
    {
      unit: "Unit 4",
      title: "Great people",
      text: "句型：Master Minds (历史上伟大的人物)\n学习人类历史上最伟大的璀璨灯塔！废寝忘食的科学家(scientist)、妙笔生花的文学作家(writer)、创造美丽的艺术家(artist)和点亮黑夜的发明家(inventor)。",
      tips: [
        "1. Writer 由 write(写) 去e 加上 er 组成，意思是写作的人；Inventor 由 invent(发明) 加上 or 组成。",
        "2. Lu Xun was a great writer. (鲁迅曾是一位伟大的作家。)"
      ],
      words: [
        { word: "scientist", phonetic: "['saɪəntɪst]", translation: "科学家" },
        { word: "writer", phonetic: "['raɪtə]", translation: "作家" },
        { word: "artist", phonetic: "['ɑːtɪst]", translation: "艺术家" },
        { word: "inventor", phonetic: "[ɪn'ventə]", translation: "发明家" }
      ],
      sentences: [
        { english: "Lu Xun was a great writer.", chinese: "鲁迅是一位伟大的作家。" },
        { english: "I want to be a scientist.", chinese: "我长大后渴望成为一名科学家。" }
      ]
    }
  ]
};
