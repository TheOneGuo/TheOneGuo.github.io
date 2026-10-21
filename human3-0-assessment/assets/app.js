/* Human3.0 能力评估系统 v2 — 评估逻辑与 30 天执行计划生成 */
window.H30App = (function () {
  'use strict';

  /* ================= 数据定义 ================= */

  var QUADS = [
    { id: 'mind',   name: '心智', en: 'Mind',   color: '#5b5ef4', soft: 'rgba(91,94,244,.10)',
      desc: '元认知 · 批判性思维 · 情绪调节 · AI 使用能力' },
    { id: 'body',   name: '身体', en: 'Body',   color: '#0e8fc4', soft: 'rgba(14,143,196,.10)',
      desc: '精力管理 · 专注力 · 沟通效能 · 职业形象' },
    { id: 'spirit', name: '精神', en: 'Spirit', color: '#0ea37a', soft: 'rgba(14,163,122,.10)',
      desc: '信任构建 · 团队协作 · 情感联结 · 价值归属' },
    { id: 'career', name: '职业', en: 'Career', color: '#e08a00', soft: 'rgba(224,138,0,.10)',
      desc: '专业技能 · 资源整合 · 商业洞察 · 价值交换' }
  ];

  /* 频率锚点量表 */
  var LIKERT = [
    { w: '几乎从不', f: '约 0%' },
    { w: '偶尔',     f: '约 25%' },
    { w: '有时',     f: '约 50%' },
    { w: '经常',     f: '约 75%' },
    { w: '几乎总是', f: '约 100%' }
  ];

  /* ================== 30 道行为锚定题 ==================
     text：以可观察行为描述；hint：判断辅助（具体例子/反例） */
  var QUESTIONS = [
    /* ---- 心智 ---- */
    { id: 'm1', quad: 'mind',
      text: '做重要判断前，我会主动寻找与自己观点相反的证据，并因此调整过结论',
      hint: '例：推翻第一直觉、让 AI 列反方论据。反例：只收集支持自己的想法' },
    { id: 'm2', quad: 'mind',
      text: '面对复杂任务，我会先拆解结构与优先级（列清单、画流程、定卡点），再动手执行',
      hint: '例：项目开始先花 15 分钟理清关键步骤与依赖关系' },
    { id: 'm3', quad: 'mind',
      text: '情绪激动（焦虑、愤怒、挫败）时，我能当场觉察并使用调节方法（暂停、深呼吸、换视角）',
      hint: '例：被质疑后先停 10 秒再回应，而不是当场反驳' },
    { id: 'm4', quad: 'mind',
      text: '我给 AI 下指令时会明确「背景、目标、约束、输出格式」，而不是一句话带过',
      hint: '例：附上受众、字数、语气要求与示例；反例：「帮我写个总结」' },
    { id: 'm5', quad: 'mind',
      text: '对 AI 给出的重要结论，我会核对事实来源或追问「这可能错在哪」之后再采用',
      hint: '例：检查数据出处、要求列出反方论据与置信度' },
    { id: 'm6', quad: 'mind',
      text: '我以固定节奏（每周/每项目）复盘关键决策，并写下做得好与待改进之处',
      hint: '例：每周五 20 分钟复盘笔记、项目后回顾会' },

    /* ---- 身体 ---- */
    { id: 'b1', quad: 'body',
      text: '工作日的核心时段，我能连续 2 小时以上不间断地做深度工作（写方案/代码/分析）',
      hint: '反例：15 分钟内忍不住看一次手机或群消息' },
    { id: 'b2', quad: 'body',
      text: '我每周至少 3 次进行 20 分钟以上的运动，且入睡与起床时间基本固定',
      hint: '快走、健身、球类均计入；作息波动 ±1 小时内算基本固定' },
    { id: 'b3', quad: 'body',
      text: '连续处理数小时任务后，我的输出质量仍与开始时接近，没有明显下滑',
      hint: '自测：下午最后一小时的产出，与上午第一小时相比如何' },
    { id: 'b4', quad: 'body',
      text: '我习惯「结论先行 + 分层展开」的表达方式，让对方一次听懂',
      hint: '例：汇报先给结论与建议，再给论据；反例：铺垫很久才到重点' },
    { id: 'b5', quad: 'body',
      text: '在高压临场场景（当众汇报、答辩、谈判）中，我能保持语速平稳、逻辑清晰',
      hint: '回忆最近一次当众表达：紧张感是否影响了表达结构' },
    { id: 'b6', quad: 'body',
      text: '我的外在呈现（文档排版、着装、线上形象）让我在合作方眼中显得专业可信',
      hint: '例：交付物格式统一、场合着装得体、头像与签名专业' },

    /* ---- 精神 ---- */
    { id: 's1', quad: 'spirit',
      text: '我会主动创造非任务的交流（问候、感谢、约咖啡）来积累与同事的信任',
      hint: '参考：每周 2 次以上非工作话题的主动交流' },
    { id: 's2', quad: 'spirit',
      text: '团队出现分歧时，我会先复述各方立场再引导讨论，推动达成共识',
      hint: '例：「我理解 A 的顾虑是…，B 担心的是…，我们能否…」' },
    { id: 's3', quad: 'spirit',
      text: '我有至少 1 个能深度交流困境与成长的伙伴或社群，且近 3 个月有过实质交流',
      hint: '实质交流 = 聊过真实困境、获得过具体建议，而非点赞之交' },
    { id: 's4', quad: 'spirit',
      text: '我能说清自己的工作最终帮到了谁、解决了什么问题，并因此感到有价值',
      hint: '例：能举出具体用户/同事受益的场景；反例：只觉得「在完成任务」' },
    { id: 's5', quad: 'spirit',
      text: '跨部门或远程协作时，我会主动对齐「谁、何时、交付什么」，减少信息损耗',
      hint: '例：会议结束当场确认结论、负责人与截止时间' },
    { id: 's6', quad: 'spirit',
      text: '遇到困难我会主动求助；他人求助时我也及时回应，形成互助关系',
      hint: '反例：闷头硬扛超过 2 天，或习惯性只索取不回馈' },

    /* ---- 职业 ---- */
    { id: 'c1', quad: 'career',
      text: '对照行业内同岗位优秀者的标准，我的核心专业技能达到中上水平',
      hint: '参考：本领域多数复杂问题我能独立解决' },
    { id: 'c2', quad: 'career',
      text: '我能把专业能力转化为业务方认可的结果（收入、效率、口碑），而不只是完成任务',
      hint: '例：方案被采纳并带来可量化的收益；反例：做完就交，不知去向' },
    { id: 'c3', quad: 'career',
      text: '近 3 个月我学会并落地使用了至少 2 个新的 AI 工具或功能，工作流因此改变',
      hint: '例：用 AI 做周报初稿、数据分析、会议纪要并固定下来' },
    { id: 'c4', quad: 'career',
      text: '解决复杂问题时，我能调用本专业之外的知识（商业、心理、设计等）组合出方案',
      hint: '例：用经济学思维分析定价，用用户视角重构流程' },
    { id: 'c5', quad: 'career',
      text: '面对目标，我能快速找到并调动所需的人、信息与工具资源，而不是等资源上门',
      hint: '例：一周内约到关键干系人并拿到承诺' },
    { id: 'c6', quad: 'career',
      text: '综合考虑能力与市场行情，我当前的收入与成长空间是匹配的',
      hint: '按真实感受作答，不必谦虚也不必苛责' },

    /* ---- 发展阶段定位 ---- */
    { id: 'g1', quad: 'stage', tag: 'dys',
      text: '我对当前的工作内容感到重复与倦怠，常想「这些事的意义是什么」',
      hint: '认知失调信号：熟练后的厌倦感，而非阶段性疲劳' },
    { id: 'g2', quad: 'stage', tag: 'dys',
      text: '我已意识到：沿用现在的方式，3 年后我很难到达想要的职业状态',
      hint: '即：对现状的不满已经指向「模式」而非「某件具体的事」' },
    { id: 'g3', quad: 'stage', tag: 'unc',
      text: '我知道自己该改变，但还没想清楚具体方向，处于观望与摇摆中',
      hint: '不确定性信号：想动但不知道往哪动' },
    { id: 'g4', quad: 'stage', tag: 'unc',
      text: '面对转型的模糊与不安，我愿意先行动再修正，而不是等想清楚才动',
      hint: '例：先报一门课/先接一个小项目，边做边看清方向' },
    { id: 'g5', quad: 'stage', tag: 'exp',
      text: '我正在系统性地学习新技能或整合新资源（课程、社群、项目实践）来支撑转变',
      hint: '探索信号：已有具体的学习计划或实践项目在进行中' },
    { id: 'g6', quad: 'stage', tag: 'exp',
      text: '我有一个明确的跃迁目标（新角色/新领域），并已持续投入 4 周以上',
      hint: '例：目标转 AI 产品经理，已完成课程 + 2 个练习项目' }
  ];

  var STEP_COUNT = 6; // 0 基本信息, 1-4 四象限, 5 阶段定位

  /* ================= 建议知识库 =================
     每象限 x 得分带：diag 诊断 / habits 每日微习惯（含锚点）/ tasks 关键任务（含完成标准）/ prompt 可复制提示词 */
  var KB = {
    mind: {
      low: {
        diag: '心智象限是「使用 AI 的能力」的根基。当前你对自己的思维过程觉察不足：较少主动验证 AI 输出、提示词偏随意、情绪容易接管判断——这会直接限制 AI 作为「能力放大器」的效率。',
        habits: [
          { t: '元认知日记（2 分钟版）', d: '锚点：下班合上电脑前。写一句话：「今天哪个判断，如有第二次机会我会怎么做？」', meta: '每天 2 分钟' },
          { t: '提示词重写', d: '锚点：每天首次打开 AI 工具时。把昨天最随意的一条提示词，按「角色—任务—约束—格式」重写后再发出。', meta: '每天 5 分钟' },
          { t: '采纳前一问', d: '锚点：每次准备采纳 AI 结论前。追问：「这个结论可能错在哪？列 2 个反方论据。」', meta: '每天 1 分钟' }
        ],
        tasks: [
          { t: 'Prompt 刻意练习：渐进具体化', d: '选 1 个真实工作任务，写 3 版提示词（极简 → 加背景 → 加约束与格式），对比输出差异，最优版存入提示词库。', std: '完成 3 组对比记录', meta: '30 分钟 × 3 次/周' },
          { t: '建立 Prompt 日志', d: '用备忘录或 Notion 记录每条重要提示词：输入、输出、哪里不满意、改了什么。这是你的 AI 能力资产。', std: '累计 ≥ 10 条', meta: '10 分钟 × 3 次/周' },
          { t: '失败反转复盘', d: '找 1 条最近「没起作用」的提示词，先写下你判断的失败原因，再重写并对比结果。', std: '1 次归因 + 重写', meta: '20 分钟 × 1 次/周' }
        ],
        prompt: { label: '思维教练：找出你的认知盲区', text: '你是我的元认知教练。以下是我过去一周的 3 个决策或判断记录：\n【粘贴决策记录】\n请逐条分析：1）我可能存在的认知偏误（如确认偏误、锚定效应）；2）我没考虑到的关键变量；3）一个有力的反方论证；4）给出一份「下次决策前的 5 项检查清单」。用表格输出。' }
      },
      mid: {
        diag: '你的心智象限处于中游：具备基本的反思与 AI 使用能力，但批判性思维的「稳定性」与 Prompt 的「可复用性」还不够——状态好与状态差时的输出差异明显。',
        habits: [
          { t: 'AI 输出批判一分钟', d: '锚点：每天首次采纳 AI 结论前。自问：「它引用的事实我核查过吗？隐含假设是什么？」', meta: '每天 1 分钟' },
          { t: '提问框架打卡', d: '锚点：每天第一次会议/讨论前。选一个框架（5W2H 或苏格拉底式提问），提前写下 2 个要问的问题。', meta: '每天 3 分钟' }
        ],
        tasks: [
          { t: '沉淀 Prompt 模板库', d: '把高频任务（周报、分析、文案）的提示词固化为模板，标注适用场景，请 AI 评审并迭代一轮。', std: '沉淀 ≥ 5 个模板', meta: '30 分钟 × 2 次/周' },
          { t: '深度批判训练', d: '每周选 1 条 AI 的重要输出：核查事实来源、逆向论证、找出隐含假设，写成 200 字批判笔记。', std: '1 篇批判笔记', meta: '25 分钟 × 1 次/周' },
          { t: '跨模型对比实验', d: '同一任务分别在「推理型」与「快速型」模型上运行，记录各自需要的提示词差异。', std: '1 组对比记录', meta: '20 分钟 × 1 次/周' }
        ],
        prompt: { label: 'Prompt 评审员：迭代你的提示词模板', text: '你是资深提示词工程师。以下是我的 3 个高频任务提示词模板：\n【粘贴模板】\n请对每个模板：1）指出结构薄弱点（缺角色/约束/格式/示例）；2）给出改进版；3）说明改进后的预期输出差异。' }
      },
      high: {
        diag: '心智象限是你的优势项：元认知与 AI 使用能力较强。下一步不是继续内卷自己，而是「资产化输出」——把个人能力转化为团队资产，并探索更进阶的人机协同模式。',
        habits: [
          { t: '每日一条进阶实验', d: '锚点：每天首次使用 AI 时。尝试一个进阶技巧（few-shot 示例、多角色分工、思维链引导），记录效果差异。', meta: '每天 5 分钟' }
        ],
        tasks: [
          { t: 'Prompt 资产化', d: '把你的提示词与思维框架整理成团队可复用文档，并做一次 15 分钟分享。', std: '文档 + 1 次分享', meta: '40 分钟 × 1 次/周' },
          { t: '长任务编排实验', d: '把一个复杂任务拆成 AI 多步骤流水线（生成 → 自检 → 修订），测试端到端稳定性。', std: '跑通 1 条流水线', meta: '45 分钟 × 1 次/周' }
        ],
        prompt: { label: '协同架构师：设计你的 AI 工作流', text: '我想把以下重复出现的复杂任务设计成「AI 多步骤工作流」：\n【描述任务与现有步骤】\n请设计：1）流程步骤拆解（每步的输入/输出）；2）每一步使用的提示词；3）质量校验点（哪一步必须人工审核）；4）预计每周节省的时间。' }
      }
    },
    body: {
      low: {
        diag: '身体象限是所有能力的「载体」。当前精力与专注状态不足，会直接拉低心智与职业象限的输出质量。原则：先修复载体，再谈提升。',
        habits: [
          { t: '精力打点', d: '锚点：每天 10 点 / 14 点 / 18 点。给当下精力打 1-5 分记入备忘录，5 天后即可看到你的精力曲线。', meta: '每天 3 次 × 20 秒' },
          { t: '90 秒重启', d: '锚点：每次感到涣散时。起身 + 喝水 + 90 秒拉伸或开窗远眺，再回到任务。', meta: '按需' },
          { t: '固定入睡锚点', d: '锚点：睡前闹钟。响铃后手机放到远处，做 3 次深呼吸，即视为入睡流程开始。', meta: '每天 2 分钟' }
        ],
        tasks: [
          { t: '5 天精力审计', d: '连续 5 个工作日记录精力打点，周末画出曲线，找出高能时段与低谷时段。', std: '精力曲线 + 3 条发现', meta: '5 分钟 × 5 天' },
          { t: '番茄钟实验周', d: '选 2 个重要工作日，用 25+5 番茄钟连跑 4 个单元，对比自由工作法的产出差异。', std: '8 个番茄钟记录', meta: '2 小时 × 2 天' },
          { t: '表达结构训练', d: '每周录 2 段 3 分钟「结论—论据—行动」结构的即兴表达并回看，标记改进点。', std: '2 段录音 + 笔记', meta: '15 分钟 × 2 次/周' }
        ],
        prompt: { label: '精力管理顾问：生成你的排程方案', text: '你是我的精力管理顾问。以下是我 5 个工作日的精力记录（10点/14点/18点，1-5 分）：\n【粘贴数据】\n我的典型任务清单：【粘贴任务】\n请：1）分析我的高能与低谷时段；2）把任务分为「深度/浅层」两类并给出排程建议；3）生成一份以周为单位的作息、运动与恢复计划，附每日提醒清单。' }
      },
      mid: {
        diag: '身体象限基本在线，但存在「波动性」问题：状态好时输出很高，疲劳期明显下滑。提升稳定性比提升峰值更重要。',
        habits: [
          { t: '深度时段锚定', d: '锚点：每天上午固定时间。进入 1 个 45-90 分钟无通知深度时段（手机勿扰 + 退出群通知）。', meta: '每天 45 分钟起' },
          { t: '睡前断联', d: '锚点：睡前闹钟。最后 30 分钟不碰工作消息，改为纸质书或拉伸。', meta: '每天 30 分钟' }
        ],
        tasks: [
          { t: '波动归因分析', d: '回顾最近 2 周的「低产出日」，归因到睡眠 / 任务切换 / 情绪三类，找出最大波动源并制定对策。', std: '3 个主因 + 对策', meta: '25 分钟 × 1 次/周' },
          { t: '高压场景预演', d: '下次重要汇报/答辩前：5 分钟呼吸法 + 3 层大纲预演（结论—支撑—行动），可用右侧提示词让 AI 打磨大纲。', std: '1 次预演记录', meta: '20 分钟 × 1 次/周' }
        ],
        prompt: { label: '表达教练：打磨你的临场大纲', text: '我即将进行一场重要汇报。主题：【主题】，听众：【角色】，时长【N】分钟，我担心的问题：【紧张点】。\n请：1）生成「结论—支撑—行动」三层大纲，每层给 1 句话示范；2）预判听众最可能的 3 个尖锐问题与应答要点；3）给我 3 个降低临场紧张的具体动作。' }
      },
      high: {
        diag: '身体象限是你的优势项：精力与表达状态稳定。策略是把高能时段与最重要产出对齐，并为高强度期设计恢复机制。',
        habits: [
          { t: '高能对齐复盘', d: '锚点：每天下班前。记录今天最高产出的一小时发生在何时，逐步把高能时段固化为核心产出窗口。', meta: '每天 2 分钟' }
        ],
        tasks: [
          { t: '精力-产出匹配表', d: '把每周最重要的 3 件事固定安排到高能时段，其余让位，执行一周并复盘匹配度。', std: '匹配表 + 1 周执行', meta: '20 分钟 × 1 次/周' },
          { t: 'AI 减负清单', d: '列出 5 项消耗精力但价值低的任务（纪要、摘要、格式整理），为每项设计 AI 化流程并移交。', std: '≥ 3 项完成移交', meta: '30 分钟 × 1 次/周' }
        ],
        prompt: { label: '任务减负：把低价值任务交给 AI', text: '以下是我每周消耗精力但价值不高的 5 项任务：【列表】。\n请为每项设计：1）可直接使用的 AI 提示词模板；2）执行流程（输入什么 → 得到什么 → 人工检查什么）；3）预计每周节省的分钟数。' }
      }
    },
    spirit: {
      low: {
        diag: '精神象限聚焦信任与联结——这是机器无法代劳的人际协同核心。当前你的协作网络与价值归属感偏弱，在跨域协作场景中会成为放大性短板。',
        habits: [
          { t: '信任微行动', d: '锚点：每天午休时。给 1 位同事发一条非工作消息（问候、感谢、分享有用信息）。', meta: '每天 2 分钟' },
          { t: '会后一句纪要', d: '锚点：每次协作会议结束前。当众或群内发一句结论：「本次共识是 X，Y 由我在 Z 前完成」。', meta: '每次会议 1 分钟' }
        ],
        tasks: [
          { t: '加入 1 个高质量社群', d: '选定 1 个行业或 AI 社群加入，本周完成首次发言，约定每月 1 次深度交流。', std: '加入 + 首次发言', meta: '30 分钟 × 1 次' },
          { t: '求助-回馈清单', d: '写下本月要主动求助的 1 件事、要回馈他人的 2 件事（引荐/评审/帮小忙），逐项执行。', std: '3 项全部完成', meta: '10 分钟制定 + 执行' },
          { t: '困难对话预演', d: '把最近一次棘手的协作分歧写成场景，用右侧提示词让 AI 扮演对方推演一轮。', std: '1 次推演 + 复盘', meta: '20 分钟 × 1 次/周' }
        ],
        prompt: { label: '沟通推演：预演你的困难对话', text: '你是我的沟通教练。我即将进行一场有挑战的对话：\n对象：【角色与关系】\n分歧点：【具体分歧】\n我的目标：【期望结果】\n流程：1）先扮演对方，用对方的立场向我提出 3 个尖锐问题；2）等我回应后，指出我表达中容易引发对抗的语句；3）给出 3 个更佳措辞与一个双赢方案框架。' }
      },
      mid: {
        diag: '精神象限处于中游：你能维持基本协作，但多停留在「事务性联结」，缺乏主动构建信任与推动共识的深度动作。',
        habits: [
          { t: '立场复述练习', d: '锚点：每次讨论出现分歧时。先说「我理解 A 的顾虑是…，B 担心的是…」，再表达自己的观点。', meta: '每次讨论' }
        ],
        tasks: [
          { t: '组织 1 次跨团队复盘会', d: '主动发起并主持一次 30 分钟复盘：明确议程、引导发言、输出共识与待办。', std: '会议完成 + 纪要发出', meta: '1 小时 × 1 次' },
          { t: '实质性帮助 1 位伙伴', d: '为 1 位同事或社群伙伴提供一次实质帮助（引荐人脉、评审方案、陪跑问题）。', std: '1 次 + 记录反馈', meta: '30 分钟 × 1 次' }
        ],
        prompt: { label: '共识引导：设计你的复盘会', text: '我要主持一场 30 分钟跨团队复盘会。议题：【议题】，参与方：【角色】，既往矛盾点：【矛盾】。\n请生成：1）分分钟议程（含时间分配）；2）每个环节的引导话术；3）预判 2 个冲突场景及调解话术；4）会议纪要模板。' }
      },
      high: {
        diag: '精神象限是你的优势项：信任与联结能力强。策略是从「联结节点」升级为「网络构建者」，把这块长板转化为团队影响力。',
        habits: [
          { t: '关系网络维护', d: '锚点：每周五。把本周有重要互动的人记入关系清单（人、事、下次跟进点）。', meta: '每周 10 分钟' }
        ],
        tasks: [
          { t: '输出协作方法论', d: '把你的信任构建 / 冲突调解经验整理成一页方法论文档，在团队内分享。', std: '文档 + 1 次分享', meta: '40 分钟 × 1 次/周' },
          { t: '搭建协作仪式', d: '为团队设计 1 个可持续的协作仪式（双周互评、月度恳谈等），试运行一轮。', std: '仪式落地 1 轮', meta: '30 分钟 × 1 次/周' }
        ],
        prompt: { label: '网络构建：规划你的影响力半径', text: '我的角色：【角色】，当前核心协作圈：【列出 5-8 人/团队】。\n请帮我：1）分析当前网络的盲区（缺哪些关键角色）；2）设计 1 个低成本的季度联结计划（每月 1-2 个动作）；3）给出关系清单的字段模板。' }
      }
    },
    career: {
      low: {
        diag: '职业象限代表你与社会系统的价值交换能力。当前专业技能与资源整合偏弱，正处于 AI 替代风险较高的区间——这是最需要优先投入的象限。',
        habits: [
          { t: 'AI 工具进阶一招', d: '锚点：每天首次用 AI 时。学 1 个新用法（快捷指令、模板、新功能）并立刻用于今天的真实工作。', meta: '每天 5 分钟' },
          { t: '行业信号扫描', d: '锚点：每天通勤或午休。看 1 条行业资讯，用一句话记录「这对我的工作意味着什么」。', meta: '每天 5 分钟' }
        ],
        tasks: [
          { t: '技能矩阵盘点', d: '列出目标岗位所需 8 项技能，按 1-5 打分，圈出差距最大的 1 项作为本季度唯一焦点。', std: '矩阵表 + 1 个季度焦点', meta: '40 分钟 × 1 次' },
          { t: 'AI 工作流改造', d: '选 1 项重复性任务（报告、数据、纪要），用提示词模板把它 AI 化，跑通并固定下来。', std: '1 条工作流落地', meta: '30 分钟 × 2 次/周' },
          { t: '前辈访谈', d: '约 1 位目标领域的前辈交流 30 分钟，带 3 个问题去：能力要求、成长路径、常见的坑。', std: '访谈 + 笔记', meta: '40 分钟 × 1 次/周' }
        ],
        prompt: { label: '职业顾问：定位你的关键差距', text: '你是我的职业发展顾问。我的行业【行业】，当前岗位【岗位】，目标角色【目标角色】。\n我的技能盘点：【粘贴矩阵】。\n请：1）对比目标角色的典型要求，指出 3 个最关键差距；2）为每个差距给出 1 个可落地的 30 天练法与推荐 AI 工具；3）把「行业信息整理」类任务设计成我可以直接交给 AI 的固定工作流。' }
      },
      mid: {
        diag: '职业象限处于中游：专业能力基本盘稳固，但「技术 × 商业」的复合价值尚未成型，距离「AI 不可替代」还有一层窗户纸。',
        habits: [
          { t: '商业视角一问', d: '锚点：每天第一次面对任务时。自问：「这件事让谁受益？值多少钱？有没有更省的解法？」', meta: '每天 1 分钟' },
          { t: '知识卡片', d: '锚点：每天下班前。把今天最有价值的 1 个洞察写成卡片（问题—解法—适用场景），存入知识库。', meta: '每天 5 分钟' }
        ],
        tasks: [
          { t: '跨域微项目', d: '启动 1 个跨界微项目：用 AI 改造一条业务流程或做一个 side project，从需求到结果端到端完成。', std: '项目上线/交付', meta: '90 分钟 × 2 次/周' },
          { t: '端到端认领', d: '在团队内主动认领 1 次方案设计任务，从需求定义做到方案呈现，练习架构者视角。', std: '1 次方案汇报', meta: '60 分钟 × 1 次/周' }
        ],
        prompt: { label: '复合价值教练：设计你的跨域项目', text: '我的专业背景：【领域】。我想用 30 天做一个「技术 × 业务」跨域微项目来证明复合价值。\n可用资源：【时间/工具/数据】。\n请：1）给我 3 个候选项目（从易到难），每个附价值验证标准；2）为推荐项目设计 4 周执行计划；3）列出每一步可用 AI 加速的环节及提示词思路。' }
      },
      high: {
        diag: '职业象限是你的优势项：已具备较强的复合价值。策略是向「系统整合者」跃迁：整合资源与他人产出，放大整体价值。',
        habits: [
          { t: '资源地图维护', d: '锚点：每周五。更新「我可用的人 / 工具 / 数据」清单，标注本周新增。', meta: '每周 10 分钟' }
        ],
        tasks: [
          { t: '认领端到端项目', d: '主动认领一个跨环节项目（需求 → 方案 → 落地 → 复盘），重点练习跨系统资源整合。', std: '项目立项并推进', meta: '持续进行' },
          { t: '搭建个人 AI 工作台', d: '把高频工作流（分析、报告、素材）固化为模板化 AI 流程，形成个人生产力系统。', std: '≥ 3 条流程固化', meta: '45 分钟 × 1 次/周' }
        ],
        prompt: { label: '系统整合：放大你的价值杠杆', text: '我的优势：【专业 + 资源 + 案例】。当前团队的重复性痛点：【列出 3 个】。\n请：1）分析我可以构建的「整合型」价值点（连接哪些环节/角色）；2）设计一个 30 天内可验证的最小整合方案；3）指出需要协调的资源与推进话术。' }
      }
    }
  };

  /* ================= 30 天重启动作库 =================
     源自 X @leitorpsique「如何在接下来 30 天重启你的生活」（单条 152 万+ 浏览，经头条转载）。\n     每条含：steps 细化执行步骤 / problem 解决的问题 / change 带来的改变（依据行为科学研究细化）。\n     会依据评估结果个性化筛选，并直接并入 30 天计划对应周的「关键任务」或「每日微习惯」。 */
  var RESTART = {
    r1: { t: '彻底打扫房间（环境重置）', quad: 'body', isDaily: false, meta: '1 次 · 60 分钟',
      d: '把你的房间 / 工作空间整理到「刚消毒过的酒店房间」级——没有一丝杂乱。',
      steps: ['设一个 60 分钟计时器，只做这一件事', '按「桌面 → 地面 → 抽屉 → 线缆」顺序清空与归位', '处理掉所有超过 30 天没碰过的东西（扔 / 送 / 收纳）', '完成后拍一张照片存入「证据」相册，作为 Day 1 基线'],
      problem: '杂乱环境持续消耗注意力与意志力，并不断暗示「旧状态还能继续」——塑造行为的首先是环境线索，而不是决心。',
      change: '零干扰的环境等于给注意力做物理降噪；「新起点效应」研究表明，环境与状态的重置能显著提升新习惯的启动成功率。' },
    r3: { t: '烧掉旧任务清单', quad: 'career', isDaily: false, meta: '15 分钟 × 1 次',
      d: '把以前积压的待办清单一笔勾销——目标不是修复过去的自己，而是从零开始建造新版本。',
      steps: ['列出所有积压待办、半成品计划和「以后再说」', '只保留两类：有截止日的承诺、涉及他人的义务', '其余全部划掉——把这张纸揉掉或烧掉，完成一个告别仪式', '从零重写一份不超过 5 项的新清单'],
      problem: '积压清单是慢性愧疚源：每看一次都在提醒「我又没做到」，于是用新的忙碌麻痹方向感。',
      change: '「新起点效应」（Fresh Start Effect）研究显示，人们在时间与状态节点上更容易启动改变；清零后，精力会自动流向真正重要的 5 件事。' },
    r8: { t: '写一封《为什么我以前失败了》', quad: 'mind', isDaily: false, meta: '30 分钟 × 1 次 + 每天重读 1 分钟',
      d: '给自己写一封非常坦诚的信，列出过去失败的态度与模式——不是惩罚自己，而是记住要抛弃什么。',
      steps: ['写下过去 2-3 次失败或半途而废的具体经历', '每条回答两个问题：哪个态度导致的？当时骗过了自己什么？', '结尾写一句给未来自己的警告', '之后每天早晨重读 1 分钟，并入晨间例程'],
      problem: '大多数人重复失败，是因为只记得「目标」而忘了「上次为什么倒下」；未经消化的教训会被情绪慢慢美化掉。',
      change: '表达性写作研究（Pennebaker）显示：把失败写成文字能减少反刍思维、释放认知带宽；每天重读则把「教训」变成每日防线上的一道闸门。' },
    r10: { t: '描述「最坏愿景」（Fear-Setting）', quad: 'mind', isDaily: false, meta: '20 分钟 × 1 次',
      d: '写下：如果一切保持现状，5 年后你的生活会是什么样子？用这个具体的画面唤醒自己。',
      steps: ['按 Tim Ferriss 的三栏 Fear-Setting 法书写：① 维持现状 5 年后的具体生活（越细越痛越好）② 每项风险如何预防 ③ 不改变的话，6 个月 / 1 年 / 3 年各要付出什么代价', '把第 ① 栏浓缩成一句话，贴在工作区', '每当想放弃时重读这句话'],
      problem: '大脑对「模糊的长期风险」不敏感，只对具体画面紧张——不做这个练习，改变的紧迫感永远不会变得真实。',
      change: '斯多葛派「预演不幸」（premeditatio malorum）与现代 Fear-Setting 实践都表明：精确定义最坏情况会同时产生紧迫感（推动改变）与安全感（最坏情况大多可预防、可承受）。' },
    r4: { t: '固定起床时间', quad: 'body', isDaily: true, meta: '每天（含周末）',
      d: '连续 30 天每天在同一时间起床——不要今天 6 点、明天 7 点。',
      steps: ['选定一个能坚持 30 天的时间（宁晚勿早）', '前一晚按起床时间倒推 7.5 小时设定入睡闹钟', '起床闹钟放在离床 2 米外，必须起身才能关', '醒后 10 分钟内：拉开窗帘见光 + 喝一杯水'],
      problem: '作息漂移是最隐蔽的精力漏洞：睡眠时长够了但节律紊乱，白天照样昏沉——自律感也在一次次「今天例外」中流失。',
      change: '睡眠规律性研究发现：作息最不规律人群的全因死亡风险比最规律者高约 53%，而固定起床时间与更好的睡眠质量、更高的白天积极情绪相关；通常 2-3 周即可感到入睡更快、晨起更清爽。' },
    r11: { t: '晨间 50 个深蹲或俯卧撑', quad: 'body', isDaily: true, meta: '每天 5 分钟',
      d: '每天早上做 50 个深蹲或俯卧撑——不需要健身房，只需要「身体每 24 小时都在进步」的证据。',
      steps: ['拆成 5 组 × 10 个，组间休息 30-60 秒', '做不动就退阶：跪姿俯卧撑 / 徒手深蹲，数量减半也算完成', '做完立刻在日历上打勾（不连打卡链）', '每 10 天加 10 个，30 天后达到 70-80 个'],
      problem: '「没时间健身」是精力低谷恶性循环的起点：越不动越没电。缺的是一个门槛极低、无任何借口的运动锚点。',
      change: '深蹲与俯卧撑都是复合动作，能一次激活多个大肌群并提升核心力量与平衡（世卫组织防跌倒指南也推荐深蹲）；更关键的是每天可见的完成证据——30 天后你获得的不只是体能，还有「我说到做到」的自我信任。' },
    r15: { t: '每日 10 分钟内心观察', quad: 'mind', isDaily: true, meta: '每天 10 分钟',
      d: '写下你感受到什么、什么让你不安、你回避了什么、哪些想法出现得最多。',
      steps: ['固定在睡前或晚饭后，使用同一本笔记本', '按四问书写：今天的感受？不安源？回避了什么？反复出现的想法？', '只描述、不评判——写「我生气了」，而不是「我不该生气」', '每周日回看一遍，圈出反复出现的模式'],
      problem: '多数人活在「自动模式」里：情绪来了就反应，从不问为什么——模式不被看见，改变就无从下手。',
      change: '表达性写作与每日反思研究显示：每天 10-15 分钟的结构化书写能减少侵入性思维、改善工作记忆与睡眠，并显著提升工作表现；几天后你就能看见此前被忽略的思维模式。' },
    r2: { t: '向「侵蚀性习惯」宣战', quad: 'career', isDaily: true, meta: '每天 1 分钟记录',
      d: '选择一个每天不知不觉侵蚀你的习惯，把它当作 30 天战争，记录每一次交锋的结果。',
      steps: ['Day 1 给敌人起名（如「午夜刷手」「会议逃兵」）', '设定交战规则：明确什么时间、什么场景绝对禁止', '每天在日志记一笔：赢 / 输 / 僵持 + 当时的触发场景', '每周日统计胜率，把胜率写进周复盘'],
      problem: '侵蚀性习惯极少被正面打败——它们赢在「无意识」：你甚至没意识到交战，就已经输了。',
      change: '把无意识习惯变成有记录的「战争」，本身就是行为疗法中的自我监控（self-monitoring）技术；每周可见的胜率曲线，通常会在 2-3 周内明显拉高你的胜场。' },
    r6: { t: '删除最常用的 App', quad: 'mind', isDaily: false, meta: '5 分钟 × 1 次',
      d: '删掉手机上你最常打开的那个应用，主屏换成最大目标的一张照片。',
      steps: ['打开屏幕使用时间统计，找出本周最耗时的那个 App', '直接卸载（不是移进文件夹）', '主屏壁纸换成你最大目标的照片或一句话', '确需使用时改用网页版——保留功能，消灭「无意识点开」'],
      problem: '最常用的 App 是注意力的最大黑洞：研究显示一次通知打断后平均需要 23 分钟才能恢复专注；「无意识点开」每年吞掉数百小时。',
      change: '这是「摩擦力设计」的直接应用：增加 10 秒的使用成本即可消灭绝大部分无意识使用；多项研究显示减用社交媒体一周，焦虑与抑郁症状即下降 15-25%，睡眠同步改善。' },
    r7: { t: '社交媒体静默', quad: 'spirit', isDaily: true, meta: '持续 30 天',
      d: '30 天内不发帖、不发故事、不评论。带着改变回来。',
      steps: ['只切断「输出」，保留最小查阅额度：每周 30 分钟，仅用于必要信息', '把社交 App 移出主屏，关闭全部通知', '把省下的时间做了什么，随手记进「证据」相册', '第 30 天写一份静默复盘：这段时间多出了什么'],
      problem: '社交表演是隐形消耗：每次发布后反复查看反馈，都是对注意力与自尊的持续抽税。',
      change: '研究提醒：突然的完全断联若短于一周反而可能加重 FOMO——所以本方案切断的是「表演循环」而保留最小查阅额度。多数人在第 2 周体验到明显的注意力回收与情绪平静。' },
    r9: { t: '消费极简挑战', quad: 'career', isDaily: true, meta: '每天 1 分钟记账',
      d: '30 天内只把钱花在不可或缺的东西上，一分钱都不能多。',
      steps: ['Day 1 写下「必需清单」：房租、餐食、通勤、必要工具', '想买清单外的东西时，先写进「30 天后再说」清单，不直接买', '每晚睡前 1 分钟记一笔：今天有无非必要支出', '30 天后统计省下金额，将一部分投入自我提升（课程 / 工具 / 访谈差旅）'],
      problem: '金钱失控往往与状态失控同步发生——「用消费补偿情绪」会进一步削弱对生活的掌控感。',
      change: '30 天「不花挑战」是一次对冲动决策的系统训练；你会拿回两样东西：一笔可支配资金，和「我能控制自己」的确认感——后者正是职业跃迁最需要的心理资产。' },
    r5: { t: '新身份假设（Acting As-If）', quad: 'mind', isDaily: true, meta: '每天',
      d: '连续 30 天在脑海中假设新身份：表现得好像你已经是想成为的那个人。',
      steps: ['Day 1 用一句话写下目标身份：「我是一个____的人」', '每天早晨自问：今天的 TA 会怎么安排这一小时？怎么处理这件事？', '每天至少做一件「那个身份的人会做」的具体小事', '以 TA 的标准行事：怎么回消息、怎么开会、怎么花钱'],
      problem: '能力提升常常卡在旧身份上：人到了新位置，行为模式还在扮演旧角色。',
      change: '「基于身份的习惯」（James Clear）指出：行为改变的终极杠杆是身份更新——每个小行动都是给新身份投的一票；30 天后「表演」会变成默认设置，因为大脑本就分不清表演与真正的改变。' },
    r12: { t: '与「改变成功者」对谈', quad: 'spirit', isDaily: false, meta: '40 分钟 × 1 次',
      d: '和一位成功彻底改变了自己生活的人交谈，问 TA 迈出的第一步，并在对话后 24 小时内执行这一步。',
      steps: ['列出 3 位候选（身边的具体的人优于遥远的大 V）', '约 30-40 分钟，带 3 个问题：第一步是什么？最难的头 30 天怎么熬？哪个决定最关键？', '录音并整理成要点笔记', '对话后 24 小时内：把 TA 的第一步翻译成你自己的版本并执行'],
      problem: '转型的最大障碍不是信息差，而是「可信度差」——你不相信普通人真的能做到，路径在别人嘴里总是抽象的。',
      change: '社会学习理论（Bandura）证明：具体榜样的示范是自我效能感最强的来源之一；一条被验证过的「第一步」加上 24 小时内执行，会把「别人的故事」变成「你的动作」。' },
    r13: { t: '建立「证据」文件夹', quad: 'mind', isDaily: true, meta: '每天 1 分钟',
      d: '在手机上建一个名为「证据」的相册，保存每天每一次小胜利的截图。疑虑袭来时打开它。',
      steps: ['今天就建相册，命名为「证据」', '每天的胜利随手截图：完成的清单、收到的好评、学会的东西、数据变化', '把本计划每日打卡的完成记录也存进去', '每次自我怀疑时，打开翻 2 分钟再回来工作'],
      problem: '自我怀疑时大脑只会检索失败记忆——因为胜利从没留下「可检索的证据」。',
      change: '「进步原理」（Amabile 对近 12,000 个工作日的研究）显示：在有意义的事情上取得进展，是积极工作状态的第一驱动力，且小胜的激励效果与大胜几乎相同——这个相册就是你的每日进度银行。' },
    r14: { t: '20:00 舒适区闹钟', quad: 'mind', isDaily: true, meta: '每天 1 分钟',
      d: '每天 20 点设一个闹钟：「今天我有进步，还是只是待在舒适区？」毫不拖泥带水地回答。',
      steps: ['现在就设好每天 20:00 的重复闹钟，闹钟名即问题', '响铃后 1 分钟内写下答案：今天进步了什么 / 待在了哪', '若答案是舒适区：立刻做一个 5 分钟的补救动作再休息', '答案同步记入当日打卡'],
      problem: '没有每日结算点，「今天先这样吧」会悄悄累计成「这半年先这样吧」。',
      change: '这是给每天装一个「收盘铃」：每天一次诚实的自我审计加必要的 5 分钟补救，30 天就是 30 次微纠偏——方向感正是这样保住的。' }
  };

  /* 重启动作的周次分配（onoff=一次性任务，daily=每日微习惯；个性化筛选后并入对应周卡） */
  var WASSIGN = {
    onoff: { 1: ['r1', 'r3', 'r8', 'r10'], 3: ['r6'], 4: ['r12'] },
    daily: { 2: ['r4', 'r11', 'r15'], 3: ['r2', 'r7', 'r9'], 4: ['r5', 'r13', 'r14'] }
  };

  var STAGE_INFO = {
    '1.0': {
      name: '规则遵循者', en: 'Stage 1.0 · Rule Follower',
      desc: '你当前的能力结构以「遵循规则、执行既定流程」为主，四维水平整体偏低。这并非定论，而是一个清晰的起点信号：在 AI 加速替代重复性工作的当下，最重要的不是焦虑，而是尽快启动第一轮「认知失调」——主动接触新领域、复盘自己的厌倦感，为跃迁制造内驱力。'
    },
    '2.0': {
      name: '个体突破者', en: 'Stage 2.0 · Individualist',
      desc: '你已经在特定领域建立了竞争力，具备专项突破能力，但四维发展不均衡——短板象限正在限制整体水位（木桶效应）。从 2.0 迈向 3.0 的关键不是继续加深长板，而是「补短板 + 系统整合」：用 AI 放大效率，把省下的精力投入人际协同与跨域整合。'
    },
    '3.0': {
      name: '系统整合者', en: 'Stage 3.0 · Integrator',
      desc: '你的四维能力均衡且高位，具备「多元视角接纳」与「跨系统资源整合」的典型特征——既善用 AI 提升效率，又能发挥人类独特的创造力与共情力。保持「实践—反馈—优化」的动态迭代，警惕技能刚性回潮，持续向更高复杂度的系统问题进发。'
    }
  };

  var STEP_INFO = {
    stable:      { name: '稳定期', en: 'Comfort Zone', desc: '尚未产生明显的改变动机', advice: '你目前处于舒适区，能力曲线趋于平缓。建议主动制造「认知失调」：接触一个让你感到不安的新领域、做一次彻底的现状复盘——不满不是坏事，它是跃迁的起点信号。' },
    dissonance:  { name: '觉醒期', en: 'Cognitive Dissonance', desc: '对现状产生厌倦与质疑', advice: '认知失调已经出现，这是打破认知固化的核心内驱力。下一步要做的不是压抑它，而是把它转化为明确的问题：「AI 迭代下，我的不可替代性在哪？」带着这个问题进入探索。' },
    uncertainty: { name: '不确定期', en: 'Uncertainty', desc: '方向模糊的过渡迷茫阶段', advice: '迷茫不是能力不足，而是从旧舒适区向新能力区过渡的必然阶段。降低探索颗粒度：不追求立刻想清楚终点，先完成 2–3 个低成本试错（一门课、一次跨部门项目、一个 AI 工具的深度实践）。' },
    exploration: { name: '探索期', en: 'Exploration', desc: '系统性整合资源构建能力基石', advice: '你已进入精准赋能阶段。关键是把探索收敛到「跃迁目标」：整合教育资源（专项课程）、工具资源（AI 辅助平台）与行业见解（前辈交流），为进入更高发展级别筑牢能力基础。' }
  };

  /* ================= 状态 ================= */

  var state = {
    step: 0,
    answers: {},
    profile: { name: '', industry: '' }
  };
  var currentKey = null; // 本轮结果的主键（用于打卡数据隔离）

  var INDUSTRIES = ['互联网/软件', 'AI/数据', '教育/培训', '金融/投资', '制造/供应链', '医疗/健康', '媒体/内容', '咨询/专业服务', '自由职业/创业者', '学生/求职中', '其他'];

  /* ================= 工具 ================= */

  function $(id) { return document.getElementById(id); }
  function avg(arr) { return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length; }
  function to100(v5) { return Math.round((v5 - 1) / 4 * 100); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function showView(id) {
    ['view-landing', 'view-quiz', 'view-result'].forEach(function (v) { $(v).classList.toggle('active', v === id); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function bandOf(score100) {
    if (score100 < 60) return { cls: 'band-low', text: '待提升' };
    if (score100 < 80) return { cls: 'band-mid', text: '良好' };
    return { cls: 'band-high', text: '优势' };
  }
  function bandKB(qid, score5) {
    return score5 < 3 ? KB[qid].low : (score5 < 4 ? KB[qid].mid : KB[qid].high);
  }

  /* ================= 测验渲染 ================= */

  function buildQuiz() {
    var html = '';

    /* step 0: 基本信息 */
    html += '<div class="quiz-panel active" data-step="0">' +
      '<h3>开始之前</h3>' +
      '<p class="pdesc">以下信息仅用于生成更贴合你处境的建议，全部可留空，数据只保存在本机浏览器中。</p>' +
      '<div class="profile-grid">' +
        '<div class="field"><label for="pfName">称呼（可选）</label>' +
          '<input id="pfName" type="text" maxlength="12" placeholder="例如：小林">' +
          '<div class="hint">将出现在报告标题中</div></div>' +
        '<div class="field"><label for="pfIndustry">所在行业 / 领域</label>' +
          '<select id="pfIndustry"><option value="">请选择（可选）</option>' +
          INDUSTRIES.map(function (i) { return '<option value="' + i + '">' + i + '</option>'; }).join('') +
          '</select></div>' +
      '</div></div>';

    /* step 1-4: 四象限 */
    QUADS.forEach(function (q, qi) {
      html += '<div class="quiz-panel" data-step="' + (qi + 1) + '">' +
        '<h3>' + q.name + '象限 · ' + q.en + '</h3>' +
        '<p class="pdesc">' + q.desc + '</p>' +
        scaleNote(false);
      QUESTIONS.filter(function (x) { return x.quad === q.id; }).forEach(function (item, i) {
        html += buildLikert(item, i + 1);
      });
      html += '</div>';
    });

    /* step 5: 阶段定位 */
    html += '<div class="quiz-panel" data-step="5">' +
      '<h3>发展阶段定位</h3>' +
      '<p class="pdesc">这一组题目用于定位你正处于「垂直发展三步法」的哪一步，与能力高低无关。</p>' +
      scaleNote(true);
    QUESTIONS.filter(function (x) { return x.quad === 'stage'; }).forEach(function (item, i) {
      html += buildLikert(item, i + 1);
    });
    html += '</div>';

    $('quizPanels').innerHTML = html;

    /* 恢复已有作答 */
    QUESTIONS.forEach(function (item) {
      var v = state.answers[item.id];
      if (v) {
        var input = document.querySelector('#quizPanels input[name="' + item.id + '"][value="' + v + '"]');
        if (input) input.checked = true;
      }
    });

    $('pfName').value = state.profile.name || '';
    $('pfIndustry').value = state.profile.industry || '';
    $('pfName').addEventListener('input', function () { state.profile.name = this.value.trim(); });
    $('pfIndustry').addEventListener('change', function () { state.profile.industry = this.value; });

    buildChips();
    goToStep(state.step);
  }

  function scaleNote(forStage) {
    var text = forStage
      ? '这组题没有好坏之分，请如实作答，才能准确定位你当前所处的跃迁阶段。'
      : '请以「过去 3 个月的行为频率」作答，评估的是真实的你，而不是理想中的自己。';
    return '<div class="scale-note">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
      '<span>' + text + ' 分值含义：1 = 几乎从不 · 3 = 约一半场景发生 · 5 = 几乎总是发生。</span></div>';
  }

  function buildLikert(item, no) {
    var opts = LIKERT.map(function (o, i) {
      return '<label><input type="radio" name="' + item.id + '" value="' + (i + 1) + '">' +
        '<span><i class="num">' + (i + 1) + '</i><i class="word">' + o.w + '</i><i class="freq">' + o.f + '</i></span></label>';
    }).join('');
    return '<div class="q-card"><div class="q-text"><span class="qno">Q' + no + '</span>' + item.text + '</div>' +
      '<div class="q-hint"><b>怎么判断</b>：' + item.hint + '</div>' +
      '<div class="likert">' + opts + '</div></div>';
  }

  function buildChips() {
    var names = ['基本信息', '心智', '身体', '精神', '职业', '阶段定位'];
    $('quizChips').innerHTML = names.map(function (n, i) {
      return '<span class="chip" data-chip="' + i + '">' + n + '</span>';
    }).join('');
  }

  function goToStep(step) {
    state.step = Math.max(0, Math.min(STEP_COUNT - 1, step));
    document.querySelectorAll('.quiz-panel').forEach(function (p) {
      p.classList.toggle('active', Number(p.dataset.step) === state.step);
    });
    document.querySelectorAll('.chip').forEach(function (c, i) {
      c.classList.toggle('on', i === state.step);
      c.classList.toggle('done', i < state.step);
    });
    $('quizStepLabel').textContent = '第 ' + (state.step + 1) + ' 步 / 共 ' + STEP_COUNT + ' 步';
    $('btnPrev').disabled = state.step === 0;
    updateNav();
    updateProgress();
  }

  function stepQuestionIds(step) {
    if (step === 0) return [];
    if (step === 5) return QUESTIONS.filter(function (q) { return q.quad === 'stage'; }).map(function (q) { return q.id; });
    var quadId = QUADS[step - 1].id;
    return QUESTIONS.filter(function (q) { return q.quad === quadId; }).map(function (q) { return q.id; });
  }

  function updateNav() {
    var ids = stepQuestionIds(state.step);
    var done = ids.every(function (id) { return state.answers[id]; });
    var btn = $('btnNext');
    if (state.step === STEP_COUNT - 1) {
      btn.textContent = done ? '生成我的评估报告 →' : '生成报告（本题组未答完）';
    } else {
      btn.textContent = '下一步 →';
    }
    btn.disabled = !done && ids.length > 0;
  }

  function updateProgress() {
    var answered = Object.keys(state.answers).length;
    $('quizAnswered').textContent = '已答 ' + answered + ' / ' + QUESTIONS.length;
    $('progressBar').style.width = (answered / QUESTIONS.length * 100) + '%';
  }

  function nextStep() {
    if (state.step < STEP_COUNT - 1) goToStep(state.step + 1);
    else finish();
  }
  function prevStep() { goToStep(state.step - 1); }

  /* ================= 评分 ================= */

  function computeResult() {
    var quadScores = {};
    QUADS.forEach(function (q) {
      var vals = QUESTIONS.filter(function (x) { return x.quad === q.id; })
        .map(function (x) { return state.answers[x.id]; });
      quadScores[q.id] = avg(vals);
    });

    var allVals = QUESTIONS.filter(function (x) { return x.quad !== 'stage'; })
      .map(function (x) { return state.answers[x.id]; });
    var overall5 = avg(allVals);
    var stageAvg = avg(QUESTIONS.filter(function (x) { return x.quad === 'stage'; })
      .map(function (x) { return state.answers[x.id]; }));

    function tagAvg(tag) {
      return avg(QUESTIONS.filter(function (x) { return x.tag === tag; })
        .map(function (x) { return state.answers[x.id]; }));
    }

    var minQuad5 = Math.min(quadScores.mind, quadScores.body, quadScores.spirit, quadScores.career);
    var stageKey;
    if (overall5 >= 3.9 && minQuad5 >= 3.4 && stageAvg >= 3.4) stageKey = '3.0';
    else if (overall5 >= 2.8 || stageAvg >= 2.8) stageKey = '2.0';
    else stageKey = '1.0';

    var exp = tagAvg('exp'), unc = tagAvg('unc'), dys = tagAvg('dys');
    var stepKey;
    if (exp >= 3.5) stepKey = 'exploration';
    else if (unc >= 3.5) stepKey = 'uncertainty';
    else if (dys >= 3.5) stepKey = 'dissonance';
    else stepKey = 'stable';

    var sorted = QUADS.slice().sort(function (a, b) { return quadScores[a.id] - quadScores[b.id]; });

    return {
      date: new Date().toISOString(),
      profile: { name: state.profile.name, industry: state.profile.industry },
      quadScores: quadScores,
      overall: to100(overall5),
      stageKey: stageKey,
      stepKey: stepKey,
      dys: dys, unc: unc, exp: exp,
      weakest: sorted[0].id,
      second: sorted[1].id,
      order: sorted.map(function (q) { return q.id; })
    };
  }

  /* ================= 结果渲染 ================= */

  function renderResult(res, prev) {
    currentKey = res.date;

    /* 头部 */
    var info = STAGE_INFO[res.stageKey];
    $('rStageBadge').textContent = (res.profile.name ? res.profile.name + ' · ' : '') + (res.profile.industry || '个人发展') + ' · 评估报告';
    $('rStageName').textContent = info.name;
    $('rStageEn').textContent = info.en;
    $('rStageDesc').textContent = info.desc;
    $('rScore').textContent = res.overall;
    $('rDate').textContent = '评估时间：' + new Date(res.date).toLocaleDateString('zh-CN');

    /* 维度条 */
    $('rDimBars').innerHTML = QUADS.map(function (q) {
      var s100 = to100(res.quadScores[q.id]);
      var band = bandOf(s100);
      return '<div class="dim-row"><div class="dl"><span>' + q.name + '象限<span class="dim-band ' + band.cls + '">' + band.text + '</span></span>' +
        '<span class="val">' + s100 + '</span></div>' +
        '<div class="bar"><i style="width:' + s100 + '%"></i></div></div>';
    }).join('');

    /* 雷达图 */
    var cap = '满分 100';
    if (prev) cap += ' · 虚线为上一轮（' + new Date(prev.date).toLocaleDateString('zh-CN') + '）对比';
    $('radarCap').textContent = cap;
    window.H30Charts.renderRadar('chart-radar', {
      labels: QUADS.map(function (q) { return q.name + '象限'; }),
      current: QUADS.map(function (q) { return to100(res.quadScores[q.id]); }),
      previous: prev ? QUADS.map(function (q) { return to100(prev.quadScores[q.id]); }) : null
    });

    /* 三步法定位 */
    var order = ['stable', 'dissonance', 'uncertainty', 'exploration'];
    $('rStepPos').innerHTML = order.map(function (k, i) {
      var s = STEP_INFO[k];
      return '<div class="step-pill' + (k === res.stepKey ? ' current' : '') + '">' +
        '<div class="snum">STEP ' + (i + 1) + ' · ' + s.en.toUpperCase() + '</div>' +
        '<h4>' + s.name + '</h4><p>' + s.desc + '</p></div>';
    }).join('');
    $('rStepAdvice').innerHTML = '<b style="color:var(--accent)">定位解读：</b>' + STEP_INFO[res.stepKey].advice;

    /* 短板诊断 */
    $('rDiag').innerHTML = [res.weakest, res.second].map(function (qid, idx) {
      var q = QUADS.find(function (x) { return x.id === qid; });
      var band = bandKB(qid, res.quadScores[qid]);
      var ctx = res.profile.industry ? '结合你在' + res.profile.industry + '领域的发展需求：' : '';
      return '<div class="diag-card' + (idx === 1 ? ' second' : '') + '">' +
        '<div class="dhead">' +
          '<div class="dicon" style="background:' + q.soft + ';color:' + q.color + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-' + q.id + '"/></svg></div>' +
          '<h4>' + q.name + '象限' + (idx === 0 ? '（首要短板）' : '（次优先）') + '</h4>' +
          '<span class="dscore">' + to100(res.quadScores[qid]) + '</span>' +
        '</div>' +
        '<p class="ddiag">' + ctx + band.diag + '</p>' +
        '<ul class="action-list">' +
          band.tasks.slice(0, 3).map(function (a) {
            return '<li><span class="cb"></span><span class="abody"><b>' + a.t + '</b><small>' + a.d + '。<b>完成标准：</b>' + a.std + '</small></span><span class="ameta">' + a.meta + '</span></li>';
          }).join('') +
        '</ul>' +
        '<div class="prompt-card"><div class="phead"><span>' + band.prompt.label + '</span>' +
          '<button onclick="H30App.copyPrompt(this)">复制提示词</button></div>' +
          '<pre>' + esc(band.prompt.text) + '</pre></div>' +
        '</div>';
    }).join('');

    /* 30 天计划 + 每日打卡 */
    var weekData = buildWeekData(res);
    renderRoutine(res);
    renderPlan(weekData);
    renderCheckin(res, weekData);
    renderRestart(res, weekData);
    renderMilestones();
    renderReview();

    /* 与上一轮对比 */
    if (prev) {
      $('rDelta').innerHTML = '与上一轮对比：' + QUADS.map(function (q) {
        var d = to100(res.quadScores[q.id]) - to100(prev.quadScores[q.id]);
        if (d === 0) return q.name + ' 持平';
        return q.name + ' <b class="' + (d > 0 ? 'up' : 'down') + '">' + (d > 0 ? '↑' : '↓') + Math.abs(d) + '</b>';
      }).join(' · ');
    } else {
      $('rDelta').innerHTML = '本轮为你的基线评估。30 天后重新评估，将自动生成变化趋势对比。';
    }

    renderIcons();
  }

  /* ---------- 个性化筛选：重启动作按评估结果并入计划 ---------- */
  function selectRestart(res) {
    var picks = {};
    function qInfo(qid) {
      var q = QUADS.find(function (x) { return x.id === qid; });
      var s = to100(res.quadScores[qid]);
      return q.name + '象限 ' + s + ' 分（' + bandOf(s).text + '）';
    }
    Object.keys(RESTART).forEach(function (rid) {
      var quad = RESTART[rid].quad;
      if (quad === res.order[0]) picks[rid] = '你的首要短板是' + qInfo(res.order[0]) + '——这条动作直接训练该象限';
      else if (quad === res.order[1]) picks[rid] = '次优先短板' + qInfo(res.order[1]) + '——用它巩固第二短板';
    });
    var third = res.order[2];
    Object.keys(RESTART).filter(function (rid) {
      return RESTART[rid].quad === third && !picks[rid];
    }).slice(0, 2).forEach(function (rid) {
      picks[rid] = '为防「木桶效应」，补充第 3 短板' + qInfo(third) + '的训练';
    });
    /* 按发展阶段补充 */
    var stageAdd = {
      stable: { r10: '你正处于稳定期——「最坏愿景」是制造认知失调、唤醒改变动机的强效动作' },
      dissonance: { r8: '你正处于觉醒期（认知失调）——把不满写进《为什么我以前失败了》，转化为可执行的反面清单' },
      uncertainty: { r5: '你正处于不确定期——新身份假设让你先「成为」，方向会在行动中变清晰', r12: '你正处于不确定期——与改变成功者对谈，能快速拿到一条被验证过的第一步' },
      exploration: { r2: '你正处于探索期——向侵蚀性习惯宣战，为探索守住注意力', r13: '你正处于探索期——用「证据」文件夹记录每一次小胜，保持探索势能' }
    }[res.stepKey] || {};
    Object.keys(stageAdd).forEach(function (rid) { if (!picks[rid]) picks[rid] = stageAdd[rid]; });
    /* 控制总量 ≤ 12 条：超出时优先剔除第 3 短板补充项 */
    var MAX = 12;
    var ids = Object.keys(picks);
    if (ids.length > MAX) {
      ids.forEach(function (rid) {
        if (Object.keys(picks).length <= MAX) return;
        if (picks[rid].indexOf('为防') === 0) { delete picks[rid]; }
      });
    }
    return picks;
  }

  function weekOfRestart(rid) {
    for (var w = 1; w <= 4; w++) {
      if ((WASSIGN.onoff[w] || []).indexOf(rid) >= 0) return w;
      if ((WASSIGN.daily[w] || []).indexOf(rid) >= 0) return w;
    }
    return 1;
  }

  function routineItems(res) {
    var wq = QUADS.find(function (q) { return q.id === res.weakest; });
    var sq = QUADS.find(function (q) { return q.id === res.second; });
    var wh = bandKB(res.weakest, res.quadScores[res.weakest]).habits[0];
    var sh = bandKB(res.second, res.quadScores[res.second]).habits[0];
    return [
      { id: 'dq1', quad: wq.name, t: wh.t, d: wh.d, meta: '每天 20 分钟 · 2 分钟版起步' },
      { id: 'dq2', quad: sq.name, t: sh.t, d: sh.d, meta: '每天 10 分钟 · 2 分钟版起步' }
    ];
  }

  /* ---------- 每日核心例程 ---------- */
  function renderRoutine(res) {
    var items = routineItems(res);
    $('rRoutine').innerHTML =
      '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>每日核心例程（30 分钟 · 已计入每日打卡）</h4>' +
      '<p class="rsub">原则：把下面两个专项「叠加」在一个每天都发生的锚点行为之后（如早咖啡后、午休回来后）。第 1 周用 2 分钟版起步，第 2-3 周自然扩展——低于意志力门槛，先保节奏再扩量。这两项会出现在上方「今日打卡」的每日必做清单里。</p>' +
      '<div class="routine-items">' +
        items.map(function (it) {
          return '<div class="routine-item"><div class="rt"><span class="dot"></span>' + it.quad + '象限专项 · ' + it.t + '</div><p>' + it.d + '</p><span class="rmeta">' + it.meta + '</span></div>';
        }).join('') +
      '</div>';
  }

  /* ---------- 30 天计划数据（重启动作已按评估结果并入每周） ---------- */
  function buildWeekData(res) {
    var picks = selectRestart(res);
    function rItem(rid) {
      var r = RESTART[rid];
      return { id: rid, rnum: 'R' + rid.slice(1), t: r.t, d: r.d, meta: r.meta,
        detail: { steps: r.steps, problem: r.problem, change: r.change } };
    }
    function selRestart(w, daily) {
      return Object.keys(picks).filter(function (rid) {
        var inWeek = (WASSIGN.onoff[w] || []).indexOf(rid) >= 0 || (WASSIGN.daily[w] || []).indexOf(rid) >= 0;
        return inWeek && RESTART[rid].isDaily === daily;
      }).map(rItem);
    }
    var wq = QUADS.find(function (q) { return q.id === res.weakest; });
    var sq = QUADS.find(function (q) { return q.id === res.second; });
    var wBand = bandKB(res.weakest, res.quadScores[res.weakest]);
    var sBand = bandKB(res.second, res.quadScores[res.second]);

    var weeks = [
      {
        label: 'WEEK 1', title: '诊断与基线',
        goal: '目标：拿到可量化的基线数据，完成环境与认知重置，写下执行意图式（何时/何地/做什么）的 30 天目标。',
        tasks: [
          { id: 'w1t1', t: '启动精力打点', d: '从今天起连续 5 个工作日，在 10 点 / 14 点 / 18 点给精力打 1-5 分，记入备忘录。', std: '累计 15 个数据点', meta: '每天 1 分钟' },
          { id: 'w1t2', t: wq.name + '象限专项盘点', d: wBand.tasks[0].d, std: wBand.tasks[0].std, meta: wBand.tasks[0].meta },
          { id: 'w1t3', t: '写下跃迁目标（执行意图版）', d: '用「何时 / 何地 / 做什么」写目标。示例：「每周一/三/五 9:30，在工位用 45 分钟练' + wq.name + '象限专项」。', std: '目标卡完成', meta: '15 分钟 × 1 次' }
        ].concat(selRestart(1, false)),
        habits: [
          { id: 'w1h1', t: '精力打点（2 分钟规则起步）', d: '本周只需做好一件事：按时给精力打分，先保 7 天连续。', meta: '20 秒 × 3 次/天' }
        ],
        ai: { label: 'AI 基线分析：生成你的 30 天重点', text: '你是我的能力发展顾问，基于 Human3.0 四维模型工作。我的四维得分（百分制）：心智' + to100(res.quadScores.mind) + '、身体' + to100(res.quadScores.body) + '、精神' + to100(res.quadScores.spirit) + '、职业' + to100(res.quadScores.career) + '，首要短板是【' + wq.name + '象限】。我的精力审计与技能盘点数据如下：\n【粘贴数据】\n请生成：1）一句话基线诊断；2）30 天内最值得投入的 3 个重点及理由；3）每个重点的每周检验标准。' }
      },
      {
        label: 'WEEK 2', title: '微习惯启动 · 主攻' + wq.name + '象限',
        goal: '目标：用 2 分钟版微习惯建立节奏，完成 1-2 项关键任务。宁少勿断。',
        tasks: wBand.tasks.slice(0, 2).map(function (a, i) {
          return { id: 'w2t' + (i + 1), t: a.t, d: a.d, std: a.std, meta: a.meta };
        }),
        habits: wBand.habits.map(function (h, i) {
          return { id: 'w2h' + (i + 1), t: h.t, d: h.d, meta: h.meta };
        }).concat(selRestart(2, true)),
        ai: wBand.prompt
      },
      {
        label: 'WEEK 3', title: '扩展与协同 · 巩固' + sq.name + '象限',
        goal: '目标：微习惯自然扩展时长，把次弱象限纳入例程，并正式把 2-3 项低价值任务移交 AI。',
        tasks: sBand.tasks.slice(0, 2).map(function (a, i) {
          return { id: 'w3t' + (i + 1), t: a.t, d: a.d, std: a.std, meta: a.meta };
        }).concat([
          { id: 'w3t3', t: 'AI 移交清单落地', d: '列出 3 项低价值重复任务，用提示词模板移交 AI，并固定为每周流程。', std: '≥ 2 项完成移交', meta: '30 分钟 × 1 次' }
        ]).concat(selRestart(3, false)),
        habits: sBand.habits.map(function (h, i) {
          return { id: 'w3h' + (i + 1), t: h.t, d: h.d, meta: h.meta };
        }).concat(selRestart(3, true)),
        ai: sBand.prompt
      },
      {
        label: 'WEEK 4', title: '整合与复盘',
        goal: '目标：完成月度复盘，生成下月重点，重测四维得分并对比基线。',
        tasks: [
          { id: 'w4t1', t: '30 天复盘报告', d: '按下方「周复盘四问」扩展为月度复盘：进步模式、反复出现的阻碍、数据变化（精力曲线、习惯完成率）。', std: '复盘报告完成', meta: '40 分钟 × 1 次' },
          { id: 'w4t2', t: '让 AI 生成下月重点', d: '把复盘记录交给 AI（用下方提示词），生成下月 3 个重点与计划调整建议。', std: '下月计划初稿', meta: '20 分钟 × 1 次' },
          { id: 'w4t3', t: '重新评估对比', d: '回到本页点击「重新评估」，生成与基线的四维对比雷达图。', std: '完成复测', meta: '8 分钟 × 1 次' }
        ].concat(selRestart(4, false)),
        habits: [
          { id: 'w4h1', t: '核心例程保持 + 自然扩展', d: '继续每日核心例程；第 4 周允许把时长扩展到完整版（两分钟规则的反向释放）。', meta: '每天 30 分钟' }
        ].concat(selRestart(4, true)),
        ai: { label: 'AI 复盘分析：生成下月重点', text: '以下是我过去 30 天的复盘记录（习惯完成情况、关键任务结果、遇到的问题）：\n【粘贴复盘记录】\n我的四维评估基线：心智' + to100(res.quadScores.mind) + ' / 身体' + to100(res.quadScores.body) + ' / 精神' + to100(res.quadScores.spirit) + ' / 职业' + to100(res.quadScores.career) + '。\n请：1）总结我的进步模式与反复出现的阻碍；2）判断计划需要如何调整，给出下月的 3 个重点；3）列出下一轮评估最值得关注的 3 个指标。' }
      }
    ];
    return { weeks: weeks, picks: picks };
  }

  /* ---------- 计划行（静态蓝图，含重启动作执行细节） ---------- */
  function planRow(a) {
    var chip = a.rnum ? '<i class="rtag">' + a.rnum + '</i>' : '';
    var body = '<div class="plan-row"><span class="tbody"><b>' + chip + a.t + '</b><small>' + a.d + (a.std ? '。<b>完成标准：</b>' + a.std : '') + '</small></span>' +
      (a.meta ? '<span class="tmeta">' + a.meta + '</span>' : '') + '</div>';
    if (a.detail) {
      body += '<details class="rdetail"><summary>执行细节 · 解决什么 · 改变什么</summary>' +
        '<div class="rgrid2" style="margin:8px 0 0"><div><h5>解决的问题</h5><p>' + a.detail.problem + '</p></div><div><h5>带来的改变</h5><p>' + a.detail.change + '</p></div></div>' +
        '<ol style="margin:8px 0 0 18px">' + a.detail.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></details>';
    }
    return body;
  }

  /* ---------- 30 天计划渲染 ---------- */
  function renderPlan(weekData) {
    $('rPlan').innerHTML = weekData.weeks.map(function (w) {
      return '<div class="week-card"><span class="wk">' + w.label + '</span><h4>' + w.title + '</h4>' +
        '<div class="wgoal">' + w.goal + '</div>' +
        '<div class="wsec">关键任务</div>' +
        w.tasks.map(function (a) { return planRow(a); }).join('') +
        '<div class="wsec">每日微习惯</div>' +
        w.habits.map(function (h) { return planRow(h); }).join('') +
        '<div class="wsec">AI 协同 · 提示词模板</div>' +
        '<div class="prompt-card"><div class="phead"><span>' + w.ai.label + '</span><button onclick="H30App.copyPrompt(this)">复制</button></div>' +
        '<pre>' + esc(w.ai.text) + '</pre></div>' +
        '</div>';
    }).join('');
  }

  /* ---------- 每日打卡系统 ---------- */
  var ciCtx = null;      // { res, start, elapsed, weekData }
  var ciSelected = null; // 当前查看的天数（null = 今天）

  function pad2(n) { return String(n).padStart(2, '0'); }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDays(ds, n) {
    var d = new Date(ds + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function dayDiff(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }
  function weekOfDay(n) { return Math.min(4, Math.ceil(n / 7)); }
  function loadDaily(res) {
    try { return JSON.parse(localStorage.getItem('h30_daily_' + res.date) || '{}'); }
    catch (e) { return {}; }
  }
  function saveDaily(res, log) {
    try { localStorage.setItem('h30_daily_' + res.date, JSON.stringify(log)); } catch (e) {}
  }

  function renderCheckin(res, weekData) {
    var start = res.date.slice(0, 10);
    var today = todayStr();
    var elapsed = Math.max(1, Math.min(30, dayDiff(start, today) + 1));
    var done30 = dayDiff(start, today) >= 30;
    ciCtx = { res: res, start: start, elapsed: elapsed, weekData: weekData };

    var log = loadDaily(res);
    function dayChecks(n) { return log[addDays(start, n - 1)] || {}; }
    function dailyIdsForWeek(w) {
      var ids = ['dq1', 'dq2'];
      weekData.weeks[w - 1].habits.forEach(function (h) { ids.push(h.id); });
      return ids;
    }
    function dayStatus(n) {
      var ds = addDays(start, n - 1);
      if (ds > today) return 'future';
      var need = dailyIdsForWeek(weekOfDay(n));
      var c = dayChecks(n);
      var done = need.filter(function (id) { return c[id]; }).length;
      if (need.length && done === need.length) return 'full';
      if (done > 0) return 'partial';
      return 'none';
    }

    /* 统计 */
    var fullCount = 0, best = 0, run = 0, streak = 0;
    for (var n = 1; n <= elapsed; n++) {
      var st = dayStatus(n);
      if (st === 'full') { fullCount++; run++; if (run > best) best = run; }
      else run = 0;
    }
    for (var m = elapsed; m >= 1; m--) {
      var st2 = dayStatus(m);
      if (st2 === 'full') streak++;
      else if (m === elapsed) continue; /* 今天未完成不打断昨天的连续 */
      else break;
    }

    var sel = Math.min(ciSelected || elapsed, elapsed);
    var selDate = addDays(start, sel - 1);
    var w = weekOfDay(sel);
    var checks = dayChecks(sel);
    var items = routineItems(res).concat(weekData.weeks[w - 1].habits);
    var taskItems = weekData.weeks[w - 1].tasks;

    $('ciDay').textContent = done30 ? '30 天周期已完成' : 'Day ' + elapsed + ' / 30';
    $('ciDate').textContent = '开始于 ' + start + ' · 今天 ' + today;
    $('ciStreak').textContent = streak;
    $('ciBest').textContent = best;
    $('ciRate').textContent = Math.round(fullCount / elapsed * 100) + '%';

    /* 30 天日历 */
    $('calGrid').innerHTML = Array.from({ length: 30 }, function (_, i) {
      var n = i + 1;
      var st = dayStatus(n);
      var cls = st === 'future' ? 'future' : (n === sel ? 'sel ' : '') + (st === 'full' ? 'full' : st === 'partial' ? 'partial' : 'none');
      if (n === elapsed && !done30) cls += ' today';
      var clickable = (st !== 'future') ? ' past' : '';
      return '<div class="cal-cell ' + cls + clickable + '" data-day="' + n + '" title="第 ' + n + ' 天 · ' + addDays(start, n - 1) + '"><span class="dnum">' + n + '</span></div>';
    }).join('');

    /* 当日清单 */
    $('ciDayLabel').textContent = '第 ' + sel + ' 天（' + selDate + '）· 第 ' + w + ' 周' + (selDate === today ? ' · 今天' : ' · 补打卡');
    function checkRow(a) {
      var checked = checks[a.id] ? ' checked' : '';
      var chip = a.rnum ? '<i class="rtag">' + a.rnum + '</i>' : '';
      return '<label class="task-row"><input type="checkbox" data-ck="' + a.id + '"' + checked + '>' +
        '<span class="ckbox"></span>' +
        '<span class="tbody"><b>' + chip + a.t + '</b>' + (a.d ? '<small>' + a.d + '</small>' : '') + '</span>' +
        (a.meta ? '<span class="tmeta">' + a.meta + '</span>' : '') +
        '</label>';
    }
    $('todayList').innerHTML =
      '<div class="ci-group">每日必做（全勤判定项）</div>' +
      items.map(checkRow).join('') +
      '<div class="ci-group">本周关键任务 / 重启动作（当天做了就勾）</div>' +
      (taskItems.length ? taskItems.map(checkRow).join('') : '<div class="ci-empty">本周无一次性任务</div>');
  }

  function setCheckinDay(n) { ciSelected = n; if (ciCtx) renderCheckin(ciCtx.res, ciCtx.weekData); }

  function handleCheckChange(input) {
    if (!ciCtx) return;
    var start = ciCtx.start;
    var elapsed = ciCtx.elapsed;
    var sel = Math.min(ciSelected || elapsed, elapsed);
    var ds = addDays(start, sel - 1);
    var log = loadDaily(ciCtx.res);
    if (!log[ds]) log[ds] = {};
    if (input.checked) log[ds][input.dataset.ck] = 1;
    else delete log[ds][input.dataset.ck];
    saveDaily(ciCtx.res, log);
    renderCheckin(ciCtx.res, ciCtx.weekData);
  }

  function resetDaily() {
    if (!ciCtx) return;
    try { localStorage.removeItem('h30_daily_' + ciCtx.res.date); } catch (e) {}
    ciSelected = null;
    renderCheckin(ciCtx.res, ciCtx.weekData);
    toast('本轮打卡数据已重置');
  }

  /* ---------- 里程碑 ---------- */
  function renderMilestones() {
    var ms = [
      { d: 'DAY 7', p: '微习惯连续完成 <b>≥ 5 / 7 天</b>了吗？若中断 ≥ 2 天，把习惯缩回 2 分钟版——先保节奏，再扩量。' },
      { d: 'DAY 14', p: '第 2 周关键任务的<b>完成标准</b>达成了吗？未达成就砍掉一半任务量，宁可少而稳，防止计划烂尾。' },
      { d: 'DAY 21', p: '习惯是否开始<b>自动化</b>（不靠意志力也能开始）？是则自然扩展时长；否则维持最小版到第 30 天。' },
      { d: 'DAY 30', p: '完成<b>复盘报告 + 重新评估</b>，与基线对比四维变化，让 AI 生成下月重点。' }
    ];
    $('rMilestones').innerHTML = ms.map(function (m) {
      return '<div class="milestone"><span class="md">' + m.d + '</span><p>' + m.p + '</p></div>';
    }).join('');
  }

  /* ---------- 周复盘模板 ---------- */
  function renderReview() {
    $('rReview').innerHTML =
      '<h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>周复盘四问（每周日晚 20 分钟，固定执行）</h4>' +
      '<p class="rsub">源自 GTD 周复盘方法：复盘之所以有效，是因为把「脑中盘旋的想法」落到纸面。</p>' +
      '<ol>' +
        '<li>本周什么真正推进了？什么卡住了，为什么？<small>只写事实与原因，不写自我批评</small></li>' +
        '<li>我注意到的模式是什么？<small>连续 2 周以上重复出现的现象，无论是好是坏</small></li>' +
        '<li>给本周打 1-5 分，写下原因<small>没有不及格的周，只有信息量不同的周</small></li>' +
        '<li>下周最重要的 3 件事——每件配上「何时 / 何地 / 怎么做」<small>执行意图格式，写完直接放进日历</small></li>' +
      '</ol>';
  }

  /* ---------- 个性化重启动作说明区 ---------- */
  function renderRestart(res, weekData) {
    var picks = weekData.picks;
    var sel = Object.keys(picks);
    var skipped = Object.keys(RESTART).filter(function (rid) { return !picks[rid]; });
    var html = '<div class="restart-p-grid">' +
      sel.map(function (rid) {
        var r = RESTART[rid];
        var q = QUADS.find(function (x) { return x.id === r.quad; });
        return '<div class="restart-card v2">' +
          '<div class="rchead2"><span class="rnum">R' + rid.slice(1) + '</span><b>' + r.t + '</b>' +
            '<span class="rtag-quad" style="background:' + q.soft + ';color:' + q.color + '">' + q.name + '象限</span>' +
            '<span class="rtag-week">第 ' + weekOfRestart(rid) + ' 周' + (RESTART[rid].isDaily ? ' · 每日' : ' · 一次性') + '</span></div>' +
          '<p class="rwhy"><b>为什么给你这条：</b>' + picks[rid] + '</p>' +
          '<div class="rgrid2"><div><h5>解决的问题</h5><p>' + r.problem + '</p></div><div><h5>带来的改变</h5><p>' + r.change + '</p></div></div>' +
          '<details class="rdetail"><summary>展开细化执行步骤（' + r.steps.length + ' 步）</summary>' +
            '<ol>' + r.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
            '<p class="rhow">执行时长：' + r.meta + '。已并入上方计划，在「今日打卡」中执行即可。</p>' +
          '</details></div>';
      }).join('') + '</div>';
    if (skipped.length) {
      html += '<div class="skip-note">另有 ' + skipped.length + ' 条未进入本轮计划：' +
        skipped.map(function (rid) { return '<b>R' + rid.slice(1) + ' ' + RESTART[rid].t + '</b>'; }).join('、') +
        ' —— 它们与你的当前评估结果匹配度较低。30 天后复测，短板变化后可能自动纳入。</div>';
    }
    $('rRestart').innerHTML = html;
  }

  /* ---------- 提示词复制 ---------- */
  function copyPrompt(btn) {
    var pre = btn.closest('.prompt-card').querySelector('pre');
    var text = pre.textContent;
    function done() { toast('提示词已复制，粘贴到任意 AI 对话框即可使用'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择文本复制'); }
      document.body.removeChild(ta);
    }
  }

  /* 嵌入式图标 */
  function renderIcons() {
    var old = document.getElementById('h30-icons');
    if (old) old.remove();
    var svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDefs.id = 'h30-icons';
    svgDefs.style.position = 'absolute';
    svgDefs.style.width = '0';
    svgDefs.style.height = '0';
    svgDefs.innerHTML =
      '<symbol id="icon-mind" viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4.2 12.6c.7.5 1.2 1.4 1.2 2.4h6c0-1 .5-1.9 1.2-2.4A7 7 0 0 0 12 2z"/></symbol>' +
      '<symbol id="icon-body" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>' +
      '<symbol id="icon-spirit" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>' +
      '<symbol id="icon-career" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></symbol>';
    document.body.appendChild(svgDefs);
  }

  /* ================= 历史记录 ================= */

  var LS_KEY = 'h30_history';

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function getPrevious() {
    var h = loadHistory();
    return h.length ? h[h.length - 1] : null;
  }
  function saveResult(res) {
    var h = loadHistory();
    h.push(res);
    if (h.length > 12) h = h.slice(-12);
    localStorage.setItem(LS_KEY, JSON.stringify(h));
  }

  /* ================= 事件绑定（一次） ================= */

  document.getElementById('quizPanels').addEventListener('change', function (e) {
    if (e.target && e.target.name && e.target.type === 'radio') {
      state.answers[e.target.name] = Number(e.target.value);
      updateProgress();
      updateNav();
    }
  });

  /* 今日打卡：勾选与日历切换 */
  document.getElementById('todayList').addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[data-ck]')) handleCheckChange(e.target);
  });
  document.getElementById('calGrid').addEventListener('click', function (e) {
    var cell = e.target.closest('.cal-cell');
    if (cell && cell.classList.contains('past')) setCheckinDay(Number(cell.dataset.day));
  });

  /* ================= 对外接口 ================= */

  function startQuiz() {
    buildQuiz();
    showView('view-quiz');
  }
  function finish() {
    var res = computeResult();
    var prev = getPrevious();
    saveResult(res);
    showView('view-result');
    renderResult(res, prev);
    toast('评估完成，报告与 30 天计划已生成');
  }
  function restart() {
    state.answers = {};
    state.step = 0;
    showView('view-landing');
  }

  return {
    startQuiz: startQuiz,
    restart: restart,
    nextStep: nextStep,
    prevStep: prevStep,
    copyPrompt: copyPrompt,
    resetDaily: resetDaily
  };
})();
