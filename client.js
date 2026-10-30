window.__ModuleLoader__.load({
  id: 'dsh-plugin-prompt',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Identity shared by the sidebar entry, the main panel, and the composer seats. */
    const PANEL_ID = 'prompt-library'
    /** Locale namespace owned by this plugin. */
    const NS = 'prompt-library'
    /** Browser-local storage key for user-authored templates. */
    const STORAGE_KEY = 'dsh.prompt-library.templates.v1'
    /** Browser-local storage key for categories that exist before they have templates. */
    const CATEGORY_STORAGE_KEY = 'dsh.prompt-library.categories.v1'
    /** Browser-local storage key for custom scene System Prompts. */
    const SCENE_PROMPT_STORAGE_KEY = 'dsh.prompt-library.scene-prompts.v1'
    /** Browser-local storage key for the last scene selected per Session (UI hint only). */
    const SCENE_SELECTION_STORAGE_KEY = 'dsh.prompt-library.scene-selection.v1'
    /** Maximum user-authored scene System Prompt length. */
    const SCENE_PROMPT_MAX = 6000
    const GENERATED_SCENE_NAME_MAX = 40
    const GENERATED_CARD_TITLE_MAX = 80
    const GENERATED_CARD_BODY_MAX = 8000
    const GENERATED_TEMPLATE_MAX = 6
    /** Built-in category ids whose localized labels double as built-in categories. */
    const BUILTIN_CATEGORY_IDS = ['workplace', 'media', 'polish', 'study', 'ppt', 'code', 'job', 'analysis', 'life', 'legal', 'meta']
    /** How long a pending cross-panel insertion stays eligible. */
    const PENDING_TTL = 8000

    // #region Locale dictionaries -------------------------------------------------

    const EN = {
      'panel.label': 'Scene Prompt Flow',
      'page.title': 'Scene Prompt Flow',
      'page.subtitle':
        'Pick a template to insert into the composer, or keep your own collection. With no conversation open, choosing a template starts a new one.',
      'action.create': 'New template',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.insert': 'Insert',
      'action.copy': 'Copy',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.confirmDelete': 'Delete',
      'action.duplicate': 'Save as mine',
      'action.manage': 'Manage library',
      'action.manageScenes': 'Manage scenes',
      'action.importScene': 'Import generated scene',
      'action.useGenerator': 'Use generator',
      'generator.title': 'Prompt Flow Generator',
      'generator.hint': 'Generate a scene and cards from your work context, then review and import. No files are created.',
      'scenes.generatorNeedsSession': 'Open a conversation first, then use the generator.',
      'scenes.generatorFailed': 'Could not start the generator.',
      'import.title': 'Import generated scene',
      'import.hint': 'Paste the JSON returned by the generator card.',
      'import.placeholder': 'Paste the generated scene JSON here…',
      'import.parse': 'Parse and preview',
      'import.confirm': 'Confirm import',
      'import.sceneName': 'Scene name',
      'import.systemPrompt': 'System Prompt',
      'import.cards': '{count} prompt cards',
      'import.editName': 'You can rename the scene before confirming.',
      'import.success': 'Scene imported',
      'import.error.empty': 'Paste JSON first.',
      'import.error.json': 'Invalid JSON. Paste the complete object.',
      'import.error.schema': 'The JSON does not match the generated-scene structure.',
      'import.error.version': 'Unsupported JSON version.',
      'import.error.name': 'Scene name must be 1–40 characters.',
      'import.error.systemPrompt': 'System Prompt is required and must not exceed 6000 characters.',
      'import.error.templates': 'Provide 1–6 prompt cards.',
      'import.error.title': 'Each card needs a title of at most 80 characters.',
      'import.error.body': 'Each card needs a prompt of at most 8000 characters.',
      'import.error.duplicate': 'A scene with this name already exists. Choose another name.',
      'import.error.exists': 'A custom scene with this name exists. Enable update to replace its System Prompt and cards.',
      'import.update': 'Update an existing custom scene with this name',
      'import.copy': 'Copy JSON',
      'import.copied': 'JSON copied',
      'import.copyFailed': 'Could not copy JSON',
      'import.updated': 'Scene updated',
      'import.error.storage': 'Could not save the scene. Check browser storage.',
      'action.back': 'Back to conversation',
      'search.placeholder': 'Search title, text, or scene',
      'search.clear': 'Clear search',
      'filter.all': 'All',
      'section.builtin': 'Built-in templates',
      'section.mine': 'My templates',
      'section.mineHint': 'Saved in this browser',
      'empty.mine': 'No templates of your own yet. Create one, or save a built-in template as an editable copy.',
      'empty.search': 'No templates match your search.',
      'count': '{count} templates',
      'badge.builtin': 'Built-in',
      'badge.mine': 'Mine',
      'badge.uncategorized': 'No scene',
      'category.add': 'New scene',
      'dialog.category': 'New scene',
      'form.categoryRequired': 'Enter a scene name.',
      'form.sceneExists': 'A scene with this name already exists.',
      'empty.category': 'No prompts in this scene yet.',
      'action.createInCategory': 'New template in this scene',
      'notice.categoryAdded': 'Scene created',
      'notice.categoryExists': 'That scene already exists; it has been selected.',
      'notice.sceneRenamed': 'Scene renamed',
      'notice.sceneDeleted': 'Scene deleted. Its prompts moved to No scene.',
      'composer.trigger': 'Prompt templates',
      'composer.title': 'Insert a template',
      'composer.search': 'Search templates',
      'composer.empty': 'No templates match your search.',
      'notice.inserted': 'Template inserted',
      'notice.insertFailed': 'Could not insert the template. Try again.',
      'notice.copied': 'Copied to the clipboard',
      'notice.copyFailed': 'Could not copy to the clipboard',
      'confirm.delete': 'Delete this template? This cannot be undone.',
      'dialog.create': 'New template',
      'dialog.edit': 'Edit template',
      'form.title': 'Title',
      'form.titlePlaceholder': 'For example: Code review',
      'form.category': 'Scene',
      'form.categoryPlaceholder': 'For example: Workplace Writing',
      'form.body': 'Template',
      'form.bodyPlaceholder': 'Write the prompt text to insert into the composer…',
      'form.required': 'A title and template text are required.',
      'form.hint': '⌘/Ctrl + Enter to save',
      'duplicate.title': '{title} (copy)',
      'category.workplace': 'Workplace Writing',
      'category.media': 'Social Media',
      'category.polish': 'Text Editing',
      'category.study': 'Learning Support',
      'category.ppt': 'Presentation Design',
      'category.code': 'Coding',
      'category.job': 'Job Search',
      'category.analysis': 'Document Analysis',
      'category.life': 'Life Planning',
      'category.legal': 'Legal Workflow',
      'category.meta': 'Prompt Flow Generator',
      'category.uncategorized': 'No scene',
      'scenes.label': 'Scene prompt flow',
      'scenes.empty': 'No scenes yet. Create templates in the library to build your first scene.',
      'scenes.insert': 'Insert prompt',
      'scenes.inserted': 'Inserted “{title}”. Check the composer before sending.',
      'scenes.insertFailed': 'Could not insert the prompt. Try again.',
      'dialog.scenes': 'Manage scenes',
      'scenes.managerHint': 'Rename or delete custom scenes. Built-in scenes are read-only.',
      'scenes.emptyManager': 'No custom scenes yet. Create one with New scene.',
      'scenes.rename': 'Rename',
      'scenes.delete': 'Delete',
      'scenes.deleteConfirm': 'Delete this scene? Its prompts will move to No scene.',
      'scenes.count': '{count} prompts',
      'scenes.systemPrompt': 'System prompt',
      'scenes.systemPromptHint': 'Optional extra instructions for this scene. Leave empty to add none.',
      'scenes.systemPromptPlaceholder': 'Add instructions for this scene…',
      'scenes.systemPromptFailed': 'Could not apply the scene system prompt.',
      'scenes.systemPromptSaved': 'System prompt saved',
      'scenes.systemPromptSaveFailed': 'Could not save the system prompt.',
      'scenes.systemPromptTooLong': 'System prompt is too long (max {max} characters).',
      'scenes.systemPromptClear': 'Clear',
      'scenes.systemPromptReadOnly': 'Built-in scenes are read-only.',
    }

    const ZH = {
      'panel.label': '场景提示流',
      'page.title': '场景提示流',
      'page.subtitle':
        '选择模板插入当前输入框，或维护自己的模板集合。没有打开的对话时，选择模板会新建一个对话。',
      'action.create': '新建模板',
      'action.save': '保存',
      'action.cancel': '取消',
      'action.insert': '插入',
      'action.copy': '复制',
      'action.edit': '编辑',
      'action.delete': '删除',
      'action.confirmDelete': '删除',
      'action.duplicate': '另存为我的模板',
      'action.manage': '管理模板库',
      'action.manageScenes': '管理场景',
      'action.importScene': '导入生成场景',
      'action.useGenerator': '使用生成器',
      'generator.title': '提示流生成器',
      'generator.hint': '根据工作场景生成场景和提示词卡片，确认后导入或更新；过程中不生成文件。',
      'scenes.generatorNeedsSession': '请先打开一个对话，再使用生成器。',
      'scenes.generatorFailed': '生成器启动失败。',
      'import.title': '导入生成场景',
      'import.hint': '粘贴“生成场景提示流”卡片返回的 JSON。',
      'import.placeholder': '在此粘贴生成场景的 JSON…',
      'import.parse': '解析并预览',
      'import.confirm': '确认导入',
      'import.sceneName': '场景名称',
      'import.systemPrompt': 'System Prompt',
      'import.cards': '{count} 张提示词卡片',
      'import.editName': '确认前可以修改场景名称。',
      'import.success': '场景已导入',
      'import.error.empty': '请先粘贴 JSON。',
      'import.error.json': 'JSON 无效，请粘贴完整对象。',
      'import.error.schema': 'JSON 不符合生成场景结构。',
      'import.error.version': '不支持的 JSON 版本。',
      'import.error.name': '场景名称需为 1–40 个字符。',
      'import.error.systemPrompt': 'System Prompt 必填，且不能超过 6000 个字符。',
      'import.error.templates': '请提供 1–6 张提示词卡片。',
      'import.error.title': '每张卡片都需要标题，且不超过 80 个字符。',
      'import.error.body': '每张卡片都需要用户提示词，且不超过 8000 个字符。',
      'import.error.duplicate': '已有同名场景，请换一个名称。',
      'import.error.exists': '已有同名自定义场景。勾选“更新”后可替换其 System Prompt 和卡片。',
      'import.update': '更新同名自定义场景',
      'import.copy': '复制 JSON',
      'import.copied': 'JSON 已复制',
      'import.copyFailed': 'JSON 复制失败',
      'import.updated': '场景已更新',
      'import.error.storage': '无法保存场景，请检查浏览器存储。',
      'action.back': '返回对话',
      'search.placeholder': '搜索标题、内容或场景',
      'search.clear': '清除搜索',
      'filter.all': '全部',
      'section.builtin': '内置模板',
      'section.mine': '我的模板',
      'section.mineHint': '保存在当前浏览器',
      'empty.mine': '还没有自己的模板。新建一个，或把内置模板另存为可编辑副本。',
      'empty.search': '没有匹配的模板。',
      'count': '共 {count} 个模板',
      'badge.builtin': '内置',
      'badge.mine': '我的',
      'badge.uncategorized': '未归入场景',
      'category.add': '新建场景',
      'dialog.category': '新建场景',
      'form.categoryRequired': '请输入场景名称。',
      'form.sceneExists': '已有同名场景。',
      'empty.category': '这个场景还没有提示词。',
      'action.createInCategory': '在此场景下新建模板',
      'notice.categoryAdded': '场景已创建',
      'notice.categoryExists': '场景已存在，已为你选中。',
      'notice.sceneRenamed': '场景已重命名',
      'notice.sceneDeleted': '场景已删除，其中的提示词已移到“未归入场景”。',
      'composer.trigger': '提示词模板',
      'composer.title': '插入模板',
      'composer.search': '搜索模板',
      'composer.empty': '没有匹配的模板。',
      'notice.inserted': '模板已插入',
      'notice.insertFailed': '模板插入失败，请重试。',
      'notice.copied': '已复制到剪贴板',
      'notice.copyFailed': '复制失败',
      'confirm.delete': '删除这个模板？此操作无法撤销。',
      'dialog.create': '新建模板',
      'dialog.edit': '编辑模板',
      'form.title': '标题',
      'form.titlePlaceholder': '例如：代码审查',
      'form.category': '场景',
      'form.categoryPlaceholder': '例如：职场写作',
      'form.body': '模板内容',
      'form.bodyPlaceholder': '输入要插入到输入框的提示词…',
      'form.required': '请填写标题和模板内容。',
      'form.hint': '⌘/Ctrl + Enter 保存',
      'duplicate.title': '{title}（副本）',
      'category.workplace': '职场写作',
      'category.media': '自媒体创作',
      'category.polish': '文字润色',
      'category.study': '学习辅导',
      'category.ppt': 'PPT 制作',
      'category.code': '编程助手',
      'category.job': '求职助手',
      'category.analysis': '资料分析',
      'category.life': '生活规划',
      'category.legal': '律师工作流',
      'category.meta': '提示流生成器',
      'category.uncategorized': '未归入场景',
      'scenes.label': '场景提示流',
      'scenes.empty': '还没有可用的场景。先在模板库中创建模板，再回来组成场景。',
      'scenes.insert': '插入提示词',
      'scenes.inserted': '已插入「{title}」，请在下方输入框检查后发送。',
      'scenes.insertFailed': '插入失败，请重试。',
      'dialog.scenes': '管理场景',
      'scenes.managerHint': '可以重命名或删除自定义场景；内置场景为只读。',
      'scenes.emptyManager': '还没有自定义场景。用“新建场景”创建一个。',
      'scenes.rename': '重命名',
      'scenes.delete': '删除',
      'scenes.deleteConfirm': '删除这个场景？其中的提示词会移到“未归入场景”。',
      'scenes.count': '{count} 条提示词',
      'scenes.systemPrompt': 'System Prompt',
      'scenes.systemPromptHint': '为这个场景补充可选指令；留空则不追加额外指令。',
      'scenes.systemPromptPlaceholder': '为这个场景补充指令…',
      'scenes.systemPromptFailed': '无法应用场景 System Prompt。',
      'scenes.systemPromptSaved': 'System Prompt 已保存',
      'scenes.systemPromptSaveFailed': '无法保存 System Prompt。',
      'scenes.systemPromptTooLong': 'System Prompt 过长（最多 {max} 个字符）。',
      'scenes.systemPromptClear': '清空',
      'scenes.systemPromptReadOnly': '内置场景为只读。',
    }

    // #endregion

    // #region Templates and persistence ------------------------------------------

    /** Built-in templates. Their text lives in the locale dictionaries so it follows the UI language. */
    /**
     * Built-in preset scenes. Each card owns a stable id, a top-level
     * category, a user-facing starter prompt, an execution mode, and a
     * dedicated System Prompt. Keep this table as the single source of truth
     * for future preset edits.
     */
    const PRESET_SCENES = [
      {
        id: 'official-notice',
        category: 'workplace',
        title: '通知公告',
        description: '起草规范、清楚的通知公告',
        body: '请帮我起草一则通知公告。以下是事项、时间、对象和发布范围等基本信息：',
        mode: 'guided',
        systemPrompt:
          '你是一名熟悉机关和企事业单位文书规范的文字工作者，负责起草通知公告。请根据用户提供的事项、时间、对象和发布范围，梳理必要信息，补充标题、正文、落款等结构；关键信息缺失时每次只询问一个必要问题，不虚构政策依据。输出应正式、准确、可直接修改使用。',
      },
      {
        id: 'official-report',
        category: 'workplace',
        title: '工作汇报',
        description: '整理重点突出的工作汇报',
        body: '请帮我写一份工作汇报。以下是我本期的工作内容、结果和遇到的问题：',
        mode: 'guided',
        systemPrompt:
          '你是一名擅长机关和企事业单位工作汇报的写作助手。请根据用户提供的工作进展、成果、问题和下一步安排，整理成重点突出、层次清楚的汇报材料；信息不足时先问清汇报对象和用途，不夸大成绩、不编造数据。输出使用正式、简洁的中文，便于口头或书面汇报。',
      },
      {
        id: 'official-request',
        category: 'workplace',
        title: '请示报告',
        description: '起草一文一事的请示报告',
        body: '请帮我起草一份请示报告。以下是请示事项、背景和需要批准的内容：',
        mode: 'guided',
        systemPrompt:
          '你是一名熟悉请示报告规范的公文写作助手。请围绕用户提出的事项，梳理背景、依据、请求内容和建议方案，形成一文一事的请示报告；缺少批准权限、时间或金额等关键信息时每次只问当前最关键的一项，不虚构政策文件。输出应理由充分、请求明确、语气得体。',
      },
      {
        id: 'official-speech',
        category: 'workplace',
        title: '讲话稿',
        description: '撰写适合现场宣讲的讲话稿',
        body: '请帮我写一篇讲话稿。以下是场合、听众、主题和预计时长：',
        mode: 'guided',
        systemPrompt:
          '你是一名擅长撰写中文讲话稿的文字助手。请根据用户提供的场合、听众、主题和时长，确定讲话重点和语气，组织开场、主体和结尾；信息不足时先询问最关键的场合与目的，不编造事迹或数据。输出应口语自然、重点突出、便于现场宣讲。',
      },
      {
        id: 'official-plan',
        category: 'workplace',
        title: '工作方案',
        description: '编制可执行的工作方案',
        body: '请帮我制定一份工作方案。以下是目标、范围、时间和资源情况：',
        mode: 'guided',
        systemPrompt:
          '你是一名熟悉项目和工作方案编制的写作助手。请根据用户给出的目标、范围、时间和资源，梳理任务分解、责任分工、进度安排和风险措施；关键约束不明时一次只确认一个必要问题，不虚构资源或政策。输出应结构完整、责任清楚、可执行，并便于后续调整。',
      },
      {
        id: 'media-xiaohongshu',
        category: 'media',
        title: '小红书笔记',
        description: '创作真实自然的小红书笔记',
        body: '请帮我写一篇小红书笔记。以下是主题、受众和真实素材：',
        mode: 'guided',
        systemPrompt:
          '你是一名熟悉小红书内容表达的创作助手。请根据用户提供的主题、受众和真实素材，写出自然、有生活感的标题和正文，突出真实体验与实用价值；缺少关键信息时简要询问，不编造使用效果或产品体验。输出应分段清晰、语气亲切，便于直接编辑发布。',
      },
      {
        id: 'media-douyin',
        category: 'media',
        title: '抖音短视频脚本',
        description: '设计节奏紧凑的抖音脚本',
        body: '请帮我写一个抖音短视频脚本。以下是主题、账号定位和时长：',
        mode: 'guided',
        systemPrompt:
          '你是一名短视频内容策划，负责抖音口播或剧情脚本。请根据用户给出的主题、账号定位和时长，设计开头钩子、分段内容、画面提示和结尾互动；信息不足时先确认受众与目标，不虚构人物经历或数据。输出应节奏紧凑、口语化、可直接拍摄。',
      },
      {
        id: 'media-wechat',
        category: 'media',
        title: '微信公众号文章',
        description: '撰写适合手机阅读的公众号文章',
        body: '请帮我写一篇微信公众号文章。以下是选题、受众和素材：',
        mode: 'guided',
        systemPrompt:
          '你是一名公众号内容编辑，擅长把主题写成有阅读感的文章。请根据用户提供的选题、受众和素材，确定标题、开头、分层正文和结尾行动；关键信息缺失时简要询问，不编造案例、引用或数据。输出应逻辑清楚、语气自然、适合手机阅读。',
      },
      {
        id: 'media-channels',
        category: 'media',
        title: '视频号文案',
        description: '提炼视频号口播与发布文案',
        body: '请帮我写一条视频号文案。以下是主题、受众和视频形式：',
        mode: 'guided',
        systemPrompt:
          '你是一名视频号文案策划，负责短中视频的标题、口播和发布文案。请根据用户提供的主题、受众和视频形式，提炼核心观点，写出简洁的开场、正文和结尾引导；信息不足时先问清目标，不虚构真实经历或效果。输出应口语顺畅、重点明确、便于直接录制。',
      },
      {
        id: 'media-headline',
        category: 'media',
        title: '社交平台标题',
        description: '生成准确不夸大的平台标题',
        body: '请帮我为以下内容拟几个社交平台标题。以下是核心信息和目标受众：',
        mode: 'guided',
        systemPrompt:
          '你是一名社交平台标题编辑，熟悉公众号、小红书、视频号等平台的表达差异。请根据用户提供的内容和受众，生成若干不做标题党、信息准确的标题备选，并简要说明适用平台和理由；缺少核心信息时先询问，不夸大、不编造事实。输出应简洁、有吸引力且可替换使用。',
      },
      {
        id: 'polish-language',
        category: 'polish',
        title: '语言润色',
        description: '润色语言，保留原意',
        body: '请润色下面这段文字，保持原意并让表达更通顺：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名中文文字编辑，负责在保留原意的前提下润色语言。请直接处理用户给出的文本，调整用词、语序和标点，使表达准确、通顺、自然；不要擅自增删事实或改变立场。仅在原文严重缺失上下文时简要询问，输出润色后的完整文本和必要的修改说明。',
      },
      {
        id: 'polish-rewrite',
        category: 'polish',
        title: '文本改写',
        description: '按用途改写已有文本',
        body: '请把下面这段文字改写为更适合目标读者的版本。用途和原文如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名中文改写编辑，负责把已有文本改写成更清晰、更适合目标读者的版本。请直接根据用户提供的原文和用途改写，保留核心信息和事实，调整结构与措辞；不要编造新内容或改变原意。信息不足时只问最关键的一点，输出完整改写稿。',
      },
      {
        id: 'polish-expand',
        category: 'polish',
        title: '扩写与缩写',
        description: '按需扩写或缩写文本',
        body: '请帮我扩写或缩写下面这段文字，保留主旨和关键事实：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名中文内容编辑，能按需要扩写或缩写文本。请先判断用户要扩写还是缩写，保留原文主旨和关键事实；扩写时补充逻辑衔接和必要细节，缩写时删去重复和次要信息。不得添加未经提供的事实。输出完整成稿，并简要说明取舍。',
      },
      {
        id: 'polish-style',
        category: 'polish',
        title: '风格转换',
        description: '转换为指定表达风格',
        body: '请把下面这段文字转换成指定风格。目标风格和原文如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名熟悉多种中文文体的编辑，负责在不改变事实和立场的前提下转换表达风格。请根据用户指定的目标风格改写原文，调整句式、语气和用词，使其符合正式、口语、营销或学术等场景；不要编造信息。输出转换后的完整文本，必要时说明主要改动。',
      },
      {
        id: 'polish-proofread',
        category: 'polish',
        title: '错别字与语病检查',
        description: '检查错别字、标点和语病',
        body: '请检查下面这段文字的错别字、标点和语病，并给出修改稿：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名细致的中文校对编辑。请检查用户文本中的错别字、标点、搭配、语序和成分残缺等问题，在不改变原意的前提下给出修改后的完整文本，并列出主要修改点；无法确定的事实或专有名词保持原样，不擅自改写。输出应准确、简洁、便于核对。',
      },
      {
        id: 'summary-daily',
        category: 'workplace',
        title: '工作日报',
        description: '整理简洁的工作日报',
        body: '请帮我写一份工作日报。以下是今天完成、进行中的事项和问题：',
        mode: 'guided',
        systemPrompt:
          '你是一名职场写作助手，负责整理工作日报。请根据用户提供的工作事项、完成进度和问题，提炼今日完成、进行中和明日计划，语言简洁、重点清楚；信息不足时先问清岗位或任务重点，不虚构工作量或成果。输出应便于直接提交给上级。',
      },
      {
        id: 'summary-weekly',
        category: 'workplace',
        title: '工作周报',
        description: '整理本周成果与下周计划',
        body: '请帮我写一份工作周报。以下是本周工作、成果和下周安排：',
        mode: 'guided',
        systemPrompt:
          '你是一名专业的职场写作助手，擅长整理工作周报。请根据用户提供的工作内容，提炼本周完成事项、工作成果、遇到的问题及下周计划，生成结构清晰、表达简洁、符合中国职场习惯的周报。信息不足时简要询问，不得虚构工作成果或数据。',
      },
      {
        id: 'summary-monthly',
        category: 'workplace',
        title: '工作月报',
        description: '整理月度成果与下月安排',
        body: '请帮我写一份工作月报。以下是本月工作、关键成果和问题：',
        mode: 'guided',
        systemPrompt:
          '你是一名熟悉月度工作总结的职场写作助手。请根据用户提供的月度工作、关键成果、问题和下月安排，按重点分类整理成月报，突出结果与影响；信息不足时先确认汇报对象，不夸大成绩、不编造数据。输出应结构清楚、简明可读。',
      },
      {
        id: 'summary-annual',
        category: 'workplace',
        title: '年终总结',
        description: '提炼全年成果与来年计划',
        body: '请帮我写一份年终总结。以下是全年工作、代表性成果和不足：',
        mode: 'guided',
        systemPrompt:
          '你是一名擅长年终总结的职场写作助手。请根据用户提供的全年工作、代表性成果、不足和来年计划，提炼主线，组织成有事实支撑的总结；缺少关键成果或数据时先询问，不虚构业绩。输出应层次清楚、重点突出、语气稳健。',
      },
      {
        id: 'summary-review',
        category: 'workplace',
        title: '工作复盘',
        description: '复盘项目，提炼可复用经验',
        body: '请帮我复盘一个项目。以下是目标、过程、结果和遇到的问题：',
        mode: 'guided',
        systemPrompt:
          '你是一名项目复盘引导者，帮助用户从经历中提炼经验。请根据用户提供的事件、目标和结果，按背景、做对了什么、问题与原因、可复用经验、下一步行动展开；信息不足时一次只追问一个关键问题，不编造因果。输出应客观、具体、可执行。',
      },
      {
        id: 'study-concept',
        category: 'study',
        title: '知识点讲解',
        description: '循序渐进讲解知识点',
        body: '请给我讲解这个知识点，并先确认我的学习阶段和已掌握内容：',
        mode: 'interactive',
        systemPrompt:
          '你是一名耐心的学科辅导老师，负责讲解知识点。请先判断用户的学习阶段和已掌握内容，用通俗语言解释概念、原理和例子，再通过一个小问题检查理解；根据回答调整深度，不重复已知信息，不编造教材原文。输出应循序渐进、条理清楚。',
      },
      {
        id: 'study-problem',
        category: 'study',
        title: '题目解析',
        description: '逐步分析题目与解题思路',
        body: '请帮我解析这道题。题干和我的思路如下：',
        mode: 'interactive',
        systemPrompt:
          '你是一名善于启发思考的辅导老师，负责解析题目。请先让用户给出完整题干和已有思路，再逐步分析条件、选择方法、展示关键步骤，最后总结易错点；不要直接跳过过程，不编造题目条件或答案。根据用户反馈调整讲解，输出清晰、可复算。',
      },
      {
        id: 'study-plan',
        category: 'study',
        title: '学习计划',
        description: '制定分阶段学习计划',
        body: '请帮我制定学习计划。以下是目标、基础、可用时间和考试节点：',
        mode: 'interactive',
        systemPrompt:
          '你是一名学习规划辅导老师。请根据用户的学习目标、基础、可用时间和考试节点，制定分阶段计划，明确每周任务、练习方式和复盘节点；信息不足时一次只问一个关键问题，不虚构时间或资源。输出应具体、可执行、便于调整。',
      },
      {
        id: 'study-exam',
        category: 'study',
        title: '考试复习',
        description: '安排考试复习重点与节奏',
        body: '请帮我制定考试复习安排。以下是科目、时间、基础和薄弱点：',
        mode: 'interactive',
        systemPrompt:
          '你是一名考试复习辅导老师，负责帮助用户高效备考。请根据考试科目、时间、基础和薄弱点，梳理知识框架、复习优先级、练习安排和模考节奏；缺少关键信息时一次只问一个关键问题，不押题、不编造考试范围。输出应重点明确、可执行。',
      },
      {
        id: 'study-qa',
        category: 'study',
        title: '互动问答',
        description: '通过互动问答巩固知识',
        body: '我想通过问答学习这个主题。请先问我一个问题，再根据回答继续：',
        mode: 'interactive',
        systemPrompt:
          '你是一名互动式学习伙伴，负责通过问答帮助用户理解知识。请围绕用户的问题给出简短准确的回答，再用追问或小练习引导其思考和巩固；根据回答调整难度，不重复已知内容，不编造事实。任务完成后自然收束，输出应清楚、友好。',
      },
      {
        id: 'ppt-outline',
        category: 'ppt',
        title: 'PPT 大纲',
        description: '设计有逻辑的 PPT 大纲',
        body: '请帮我设计一份 PPT 大纲。以下是主题、受众、目的和时长：',
        mode: 'guided',
        systemPrompt:
          '你是一名演示文稿策划，负责设计 PPT 大纲。请根据用户提供的主题、受众、汇报目的和时长，提炼核心结论，安排封面、目录、主体和结尾的页面逻辑；缺少关键信息时先问清场景，不堆砌空泛标题。输出应层次清楚、每页一个重点。',
      },
      {
        id: 'ppt-report',
        category: 'ppt',
        title: '工作汇报 PPT',
        description: '组织工作汇报演示结构',
        body: '请帮我设计工作汇报 PPT。以下是成果、数据和问题：',
        mode: 'guided',
        systemPrompt:
          '你是一名擅长工作汇报演示的策划。请根据用户提供的工作成果、数据和问题，组织成结论先行、证据充分的汇报 PPT 结构，区分现状、成绩、问题和计划；不虚构数据或业绩。信息不足时一次只确认一个关键问题，输出逐页标题、要点和讲解提示。',
      },
      {
        id: 'ppt-teaching',
        category: 'ppt',
        title: '教学演示 PPT',
        description: '设计教学演示与互动节奏',
        body: '请帮我设计教学演示 PPT。以下是知识点、学段和课时：',
        mode: 'guided',
        systemPrompt:
          '你是一名教学设计助手，负责制作教学演示 PPT 的结构。请根据用户提供的知识点、学生基础和课时，按导入、讲解、示例、练习、总结组织页面，控制每页信息量；信息不足时先问清学段和目标，不编造教材内容。输出应便于讲解和互动。',
      },
      {
        id: 'ppt-product',
        category: 'ppt',
        title: '产品介绍 PPT',
        description: '组织产品介绍 PPT 结构',
        body: '请帮我设计产品介绍 PPT。以下是功能、目标客户和差异点：',
        mode: 'guided',
        systemPrompt:
          '你是一名产品演示策划，负责产品介绍 PPT 的结构。请根据用户提供的产品功能、目标客户、使用场景和差异点，组织痛点、方案、价值、案例和行动建议；不虚构客户案例或效果数据。关键信息不足时先询问，输出逐页标题与要点。',
      },
      {
        id: 'ppt-notes',
        category: 'ppt',
        title: '演讲稿与讲解备注',
        description: '为每页 PPT 写口语讲稿',
        body: '请为这份 PPT 的每页写讲解备注。以下是页面内容和听众：',
        mode: 'guided',
        systemPrompt:
          '你是一名演讲教练，负责为 PPT 编写讲稿和讲解备注。请根据用户提供的页面内容、听众和时长，为每页写出自然的口语讲稿，补充过渡句、重点提示和可能的提问；不照读页面、不编造事实。输出应与页面一一对应，便于排练。',
      },
      {
        id: 'code-generate',
        category: 'code',
        title: '代码生成',
        description: '按约束生成可维护代码',
        body: '请帮我实现下面的功能。语言、运行环境和输入输出要求如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名注重可维护性的软件开发工程师，负责根据需求生成代码。请先确认语言、运行环境和输入输出约束，再给出完整实现、必要注释和运行示例；信息不足时只问关键项。不要编造测试结果，不确定的依赖或接口需明确说明。输出应可直接落地。',
      },
      {
        id: 'code-debug',
        category: 'code',
        title: 'Bug 排查',
        description: '定位报错原因并给出修复方案',
        body: '请帮我排查这个错误。代码、报错信息和运行环境如下：',
        mode: 'interactive',
        systemPrompt:
          '你是一名经验丰富的软件开发工程师，擅长分析和修复程序错误。请根据用户提供的代码、报错信息及运行环境定位可能原因，给出清晰的排查步骤和修复方案。必要时询问关键上下文，不得声称已运行未经实际执行的代码或测试。',
      },
      {
        id: 'code-explain',
        category: 'code',
        title: '代码解释',
        description: '分层解释代码逻辑与风险',
        body: '请解释下面这段代码的目的、执行流程和潜在风险：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名代码讲解工程师，负责帮助用户理解代码。请先说明代码的整体目的和调用关系，再按执行顺序解释关键逻辑、数据结构、边界条件和潜在风险；对未提供的实现不要猜测。信息不足时简要询问，输出应准确、分层、便于对照源码阅读。',
      },
      {
        id: 'code-optimize',
        category: 'code',
        title: '代码优化',
        description: '在约束内优化代码质量',
        body: '请帮我优化下面这段代码。运行环境和性能目标如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名关注性能和可维护性的工程师，负责优化代码。请先理解用户给出的实现、运行环境和性能目标，再从正确性、复杂度、内存、可读性方面提出优化方案，必要时给出改写代码；不虚构基准测试结果。信息不足时先确认约束，输出改动理由和风险。',
      },
      {
        id: 'code-review',
        category: 'code',
        title: '代码审查',
        description: '按严重程度审查代码',
        body: '请审查下面这段代码，并说明变更背景：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名严谨的代码审查工程师。请根据用户提供的代码和变更背景，检查正确性、边界条件、错误处理、安全性、性能和可维护性，按严重程度列出问题、影响和修改建议；不编造未提供的测试结果。信息不足时先询问关键上下文，输出应具体、可操作。',
      },
      {
        id: 'job-resume',
        category: 'job',
        title: '简历优化',
        description: '按真实经历优化中文简历',
        body: '请帮我优化简历。目标岗位、现有简历和真实经历如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名求职简历顾问，负责帮助用户优化中文简历。请根据用户的真实经历、目标岗位和现有简历，调整结构、措辞和重点，突出与岗位相关的成果；不得编造学历、工作经历、项目或数据。缺少关键信息时一次只问一个关键问题，输出可替换的简历段落和修改说明。',
      },
      {
        id: 'job-jd',
        category: 'job',
        title: '岗位分析',
        description: '拆解岗位要求并评估匹配度',
        body: '请分析这个岗位。岗位描述和我的背景如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名招聘与岗位分析顾问。请根据用户提供的岗位描述和个人背景，拆解岗位职责、硬性要求、核心能力和潜在考察点，评估匹配度并给出准备建议；不要臆测公司内部信息或薪资。信息不足时先询问目标，输出应结构清楚、判断有依据。',
      },
      {
        id: 'job-cover',
        category: 'job',
        title: '求职信写作',
        description: '写匹配岗位的中文求职信',
        body: '请帮我写一封求职信。目标岗位、真实经历和求职动机如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名中文求职信写作顾问。请根据用户提供的目标岗位、真实经历和求职动机，写一封简洁、真诚、与岗位匹配的求职信，突出可验证的能力和贡献；不得编造经历或夸大成果。信息不足时先问关键项，输出应可直接修改投递。',
      },
      {
        id: 'job-mock',
        category: 'job',
        title: '面试模拟',
        description: '进行连续追问的面试模拟',
        body: '请和我进行面试模拟。目标岗位和我的背景如下：',
        mode: 'interactive',
        systemPrompt:
          '你是一名面试官，负责进行岗位面试模拟。请根据用户提供的岗位和背景，一次提出一个有针对性的问题，根据回答继续追问或切换主题，并在每轮给出简短反馈；不虚构公司信息，不替用户编造经历。任务结束时总结表现和改进建议。',
      },
      {
        id: 'job-questions',
        category: 'job',
        title: '面试问题准备',
        description: '准备面试问题与回答思路',
        body: '请帮我准备面试问题。目标岗位、行业和经历如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名面试准备顾问。请根据用户的目标岗位、行业和经历，预测可能被问到的专业问题、行为问题和反问，按类别给出问题、考察点和回答思路；不要编造用户经历或公司内幕。信息不足时先确认岗位，输出应便于用户逐题准备。',
      },
      {
        id: 'analysis-summary',
        category: 'analysis',
        title: '长文总结',
        description: '忠实提炼长文核心信息',
        body: '请总结下面这篇长文，保留核心观点、事实和结论：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名忠实于原文的资料整理助手，负责总结长文。请提炼核心观点、关键事实、论证结构和结论，区分作者观点与客观信息，保留重要限定条件；不添加原文没有的来源或数据。信息不足时说明，输出应简明、准确、可追溯。',
      },
      {
        id: 'analysis-organize',
        category: 'analysis',
        title: '资料整理',
        description: '把零散资料整理成结构',
        body: '请帮我整理这些资料。使用目的和材料如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名资料整理助手，负责把零散材料整理成可用结构。请根据用户提供的资料和目标，分类、去重、建立目录和要点，标注信息缺口与不确定内容；不编造资料或来源。信息不足时先问清用途，输出应层次清楚、便于检索和继续加工。',
      },
      {
        id: 'analysis-extract',
        category: 'analysis',
        title: '关键信息提取',
        description: '按字段提取关键信息',
        body: '请从下面文本中提取关键信息。目标字段和原文如下：',
        mode: 'one-shot',
        systemPrompt:
          '你是一名信息提取助手，负责从给定文本中抽取关键信息。请按用户指定的字段或目标，提取人物、时间、地点、数字、结论、条件等要素，保留原文限定，区分明确事实与推测；不补造缺失信息。输出应结构化、简洁，并标出无法确认的项。',
      },
      {
        id: 'analysis-compare',
        category: 'analysis',
        title: '多方案对比',
        description: '建立维度比较多个方案',
        body: '请对比以下方案。目标、约束和方案信息如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名方案分析顾问，负责比较多个选项。请根据用户提供的方案、目标和约束，建立一致的比较维度，列出各方案的做法、成本、收益、风险和适用条件，指出信息缺口；不编造数据或偏好。输出应客观、表格化，并给出有条件的建议。',
      },
      {
        id: 'analysis-research',
        category: 'analysis',
        title: '研究分析',
        description: '结构化分析研究问题',
        body: '请帮我分析这个研究问题。背景、范围和已知信息如下：',
        mode: 'interactive',
        systemPrompt:
          '你是一名研究分析助手，负责围绕问题开展结构化分析。请先澄清研究问题、范围和判断标准，再梳理已知事实、不同观点、证据强弱和不确定性，提出可验证的下一步；不编造来源、数据或结论。信息不足时一次只问一个关键问题，输出应严谨、分层。',
      },
      {
        id: 'life-travel',
        category: 'life',
        title: '旅行行程规划',
        description: '规划节奏合理的旅行行程',
        body: '请帮我规划旅行行程。目的地、天数、预算和同行人如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名旅行行程规划助手。请根据用户的目的地、天数、预算、同行人和偏好，安排合理的每日路线、交通、餐饮和备选方案，控制节奏并留出弹性；价格、营业时间和政策需提醒用户实时核实，不凭空保证。信息不足时先问关键项，输出清晰可执行。',
      },
      {
        id: 'life-goals',
        category: 'life',
        title: '个人目标计划',
        description: '把目标拆成阶段行动计划',
        body: '请帮我制定个人目标计划。目标、现状、时间和资源如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名个人目标规划助手。请根据用户的目标、现状、可投入时间和资源，把目标拆成阶段里程碑与每周行动，明确优先级、衡量方式和复盘节奏；不虚构用户能力或资源。信息不足时一次只问一个关键问题，输出应具体、可执行、可调整。',
      },
      {
        id: 'life-purchase',
        category: 'life',
        title: '购买决策',
        description: '按需求和预算分析购买决策',
        body: '请帮我做一个购买决策。预算、使用场景和候选方案如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名理性的购买决策助手。请根据用户的预算、使用场景、核心需求和候选产品，建立比较维度，分析优缺点、隐性成本和适用条件，提醒价格与库存需实时核实；不编造参数或用户评价。信息不足时先问关键需求，输出应客观、有条件、便于决策。',
      },
      {
        id: 'life-time',
        category: 'life',
        title: '时间管理',
        description: '安排可执行的时间管理方案',
        body: '请帮我安排时间。任务、截止时间、精力和固定安排如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名时间管理教练。请根据用户的任务清单、截止时间、精力和固定安排，帮助区分重要与紧急，安排专注时段、缓冲和休息，给出可执行的日程与取舍建议；不虚构用户时间或强迫固定模板。信息不足时先问关键约束，输出应简洁、可调整。',
      },
      {
        id: 'life-problem',
        category: 'life',
        title: '生活问题分析',
        description: '梳理生活问题的原因与选项',
        body: '请帮我分析一个生活问题。情境、目标和限制如下：',
        mode: 'interactive',
        systemPrompt:
          '你是一名生活问题分析助手。请先听清用户遇到的具体情境、目标和限制，区分事实、感受与推测，梳理可能原因和可选做法，比较利弊并给出下一步行动；不替用户做重大决定，不编造政策或专业结论。信息不足时一次只问一个关键问题，输出应务实、尊重用户。',
      },
      {
        id: 'legal-intake',
        category: 'legal',
        title: '接案咨询',
        description: '梳理事实、争议焦点与接案风险',
        body: '请帮我梳理这个案件的事实、争议焦点和需要补充的信息。客户陈述和现有材料如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名执业律师的案件助理，负责接案咨询和事实梳理。请围绕客户目标、主体身份、时间线、争议焦点、已发生行为和现有材料提问，一次只问一个关键问题；区分客户陈述、客观事实和待核实信息，不做确定性法律结论，不虚构法条或案例。输出应包含事实时间线、争议焦点、缺失信息、初步风险与下一步行动。',
      },
      {
        id: 'legal-research',
        category: 'legal',
        title: '法律检索',
        description: '检索现行法律依据并分析适用',
        body: '请围绕以下法律问题检索中国大陆现行法律依据，并分析适用条件和不确定性：',
        mode: 'guided',
        systemPrompt:
          '你是一名严谨的法律检索助手，负责围绕具体法律问题检索中国大陆现行法律、行政法规、司法解释和指导性案例。请先确认问题、时间、地域和审级，按效力层级列明依据、适用条件和例外，区分现行有效与已废止版本；不编造法条、案号或裁判结果，并提醒用户以官方最新文本核实。输出应问题导向、引用可核验、结论有边界。',
      },
      {
        id: 'legal-evidence',
        category: 'legal',
        title: '证据梳理',
        description: '整理证据目录、证明目的与补证清单',
        body: '请帮我整理证据目录、证明目的和举证缺口。现有材料清单和诉讼请求如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名诉讼证据整理助手，负责根据案件事实和诉讼请求梳理证据。请列出证据名称、来源、形式、证明目的、对应争议焦点和举证期限，区分原件、复印件和待补证据，说明举证责任与可能的质证风险；不虚构证据或事实。信息不足时一次只问一个关键问题，输出应形成可直接使用的证据目录和补证清单。',
      },
      {
        id: 'legal-strategy',
        category: 'legal',
        title: '诉讼策略',
        description: '制定诉讼/仲裁策略与代理意见',
        body: '请帮我分析诉讼/仲裁策略并起草代理意见框架。案件事实、证据和诉求如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名诉讼策略与代理意见起草助手。请根据案件事实、证据、诉讼请求和程序阶段，分析管辖、时效、主体、请求权基础、抗辩和反诉可能，比较诉讼、仲裁与和解方案的成本和风险，再起草代理意见框架；不承诺裁判结果，不编造法律依据。信息不足时逐项确认，输出应区分事实、证据、法律分析和建议。',
      },
      {
        id: 'legal-contract',
        category: 'legal',
        title: '合同审查',
        description: '审查合同风险并给出修改建议',
        body: '请审查这份合同的风险条款并给出修改建议。合同文本和交易背景如下：',
        mode: 'guided',
        systemPrompt:
          '你是一名合同审查与法律意见助手，负责审查中国大陆民商事合同。请结合交易背景和双方地位，检查主体、标的、价款、履行、违约、解除、争议解决、保密和合规条款，区分无效、可撤销、效力待定与商业风险，给出修改建议和替代条款；不虚构法律依据或交易事实。输出应按风险等级列出问题、依据和建议，并提示需律师复核。',
      },
    ]



    /**
     * Meta scene: one generator card. It produces a JSON scene package that the
     * library imports after the user reviews it. The generator is not a normal
     * work preset and is kept out of PRESET_SCENES so the work presets stay
     * intact.
     */
    const META_SCENES = [
      {
        id: 'flow-generator',
        category: 'meta',
        title: '生成场景提示流',
        description: '根据行业、岗位和任务生成场景与提示词卡片，先列出结果并附可复制 JSON，确认后到模板库导入或更新。',
        body: '请根据我的实际工作场景，帮我生成一个可复用的场景提示流。先用列表展示建议的场景、System Prompt 和提示词卡片，再附上可复制的 JSON。我的行业、岗位、日常任务和期望结果是：',
        mode: 'guided',
        systemPrompt:
          '你是一名场景提示流设计助手，负责根据用户的实际工作场景设计可复用的场景和提示词卡片。请先确认行业、岗位、核心任务、目标读者和期望产出；信息不足时一次只问一个关键问题，不编造业务事实、数据、案例或来源。使用中国大陆简体中文，任务简单时直接设计，复杂时先确认必要信息。生成结果先用列表展示：场景名称、场景 System Prompt、每张卡片的标题和用户提示词；在列表之后附一个 ```json 代码块，内含可直接导入的 JSON。不要在过程中创建或写入文件，不要声称已经导入；用户确认由插件的导入预览完成。JSON 结构必须是：{"version":1,"scene":{"name":"场景名称","systemPrompt":"场景级 System Prompt","templates":[{"title":"卡片标题","body":"用户提示词"}]}}。要求：scene.name 不超过40字，避免与常见分类同名；scene.systemPrompt 是场景级系统指令，包含角色、任务、交互规则和输出要求；templates 为1至6张卡片，每张 title 不超过80字，body 是可直接使用的用户提示词。所有内容用简体中文，卡片之间职责不重复，不虚构事实或结果。',
      },
    ]

    const BUILTINS = [...PRESET_SCENES, ...META_SCENES]

    function newId() {
      try {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
          return `tpl-${window.crypto.randomUUID()}`
        }
      } catch (_unavailable) {
        /* fall through to the timestamp form */
      }
      return `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }

    function normalizeTemplate(value) {
      if (value === null || typeof value !== 'object') return null
      const title = typeof value.title === 'string' ? value.title.trim() : ''
      const body = typeof value.body === 'string' ? value.body : ''
      if (title === '' || body.trim() === '') return null
      const category = typeof value.category === 'string' ? value.category.trim() : ''
      const id = typeof value.id === 'string' && value.id !== '' ? value.id : newId()
      const updatedAt = typeof value.updatedAt === 'number' ? value.updatedAt : Date.now()
      const order = typeof value.order === 'number' && Number.isFinite(value.order) ? value.order : null
      return { id, title, body, category, updatedAt, order }
    }

    function templateCategoryKey(category) {
      return typeof category === 'string' ? category.trim().toLowerCase() : ''
    }

    /** Normalize per-category card order, including templates saved before scene ordering existed. */
    function assignTemplateOrders(templates) {
      const groups = new Map()
      for (const template of templates) {
        const key = templateCategoryKey(template.category)
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(template)
      }
      const next = templates.slice()
      for (const group of groups.values()) {
        const ordered = group.slice().sort((left, right) => {
          const leftOrder = typeof left.order === 'number' ? left.order : Number.MAX_SAFE_INTEGER
          const rightOrder = typeof right.order === 'number' ? right.order : Number.MAX_SAFE_INTEGER
          return leftOrder - rightOrder || right.updatedAt - left.updatedAt
        })
        ordered.forEach((template, order) => {
          const index = next.findIndex((entry) => entry.id === template.id)
          if (index !== -1) next[index] = { ...template, order }
        })
      }
      return next
    }

    function loadTemplates() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw === null) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return assignTemplateOrders(parsed.map(normalizeTemplate).filter((item) => item !== null))
      } catch (error) {
        console.error('prompt-library: could not read saved templates', error)
        return []
      }
    }

    function persistTemplates(next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.error('prompt-library: could not save templates', error)
      }
    }

    let userTemplates = loadTemplates()
    const templateListeners = new Set()

    function normalizeCategory(value) {
      return typeof value === 'string' ? value.trim() : ''
    }

    function loadCategories() {
      try {
        const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
        if (raw === null) return null
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        const seen = new Set()
        const categories = []
        for (const value of parsed) {
          const name = normalizeCategory(value)
          if (name === '') continue
          const key = name.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          categories.push(name)
        }
        return categories
      } catch (error) {
        console.error('prompt-library: could not read saved categories', error)
        return []
      }
    }

    function persistCategories(next) {
      try {
        window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.error('prompt-library: could not save categories', error)
      }
    }

    const storedCategories = loadCategories()
    let userCategories = storedCategories === null ? [] : storedCategories
    const categoryListeners = new Set()

    function subscribeCategories(listener) {
      categoryListeners.add(listener)
      return () => {
        categoryListeners.delete(listener)
      }
    }

    function getCategoriesSnapshot() {
      return userCategories
    }

    function setUserCategories(next) {
      userCategories = next
      persistCategories(next)
      for (const listener of [...categoryListeners]) listener()
    }

    if (storedCategories === null) {
      const seed = []
      for (const template of userTemplates) {
        const name = template.category.trim()
        if (name !== '' && !seed.some((entry) => entry.toLowerCase() === name.toLowerCase())) seed.push(name)
      }
      if (seed.length > 0) {
        userCategories = seed
        persistCategories(seed)
      }
    }

    /** Canonical key for a user scene's custom System Prompt. */
    function scenePromptKey(sceneKey) {
      if (typeof sceneKey !== 'string') return ''
      if (sceneKey.startsWith('builtin:')) {
        const id = sceneKey.slice('builtin:'.length)
        return BUILTIN_CATEGORY_IDS.includes(id) ? `builtin:${id}` : ''
      }
      if (sceneKey.startsWith('user:')) {
        const name = sceneKey.slice('user:'.length).trim().toLowerCase()
        return name === '' ? '' : `user:${name}`
      }
      return ''
    }

    /** Preserve the exact scene key used by tabs; validate it for selection storage. */
    function sceneSelectionKey(sceneKey) {
      if (typeof sceneKey !== 'string') return ''
      if (sceneKey.startsWith('builtin:')) {
        const id = sceneKey.slice('builtin:'.length)
        return BUILTIN_CATEGORY_IDS.includes(id) ? `builtin:${id}` : ''
      }
      if (sceneKey.startsWith('user:')) {
        const name = sceneKey.slice('user:'.length).trim()
        return name === '' ? '' : `user:${name}`
      }
      return ''
    }

    function normalizeScenePrompts(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
      const next = {}
      for (const [rawKey, rawText] of Object.entries(value)) {
        const key = scenePromptKey(rawKey)
        if (!key.startsWith('user:')) continue
        if (typeof rawText !== 'string') continue
        const text = rawText.trim()
        if (text === '' || text.length > SCENE_PROMPT_MAX) continue
        next[key] = text
      }
      return next
    }

    function loadScenePrompts() {
      try {
        const raw = window.localStorage.getItem(SCENE_PROMPT_STORAGE_KEY)
        if (raw === null) return {}
        return normalizeScenePrompts(JSON.parse(raw))
      } catch (error) {
        console.error('prompt-library: could not read scene system prompts', error)
        return {}
      }
    }

    function persistScenePrompts(next) {
      try {
        window.localStorage.setItem(SCENE_PROMPT_STORAGE_KEY, JSON.stringify(next))
        return true
      } catch (error) {
        console.error('prompt-library: could not save scene system prompts', error)
        return false
      }
    }

    let userScenePrompts = loadScenePrompts()
    const scenePromptListeners = new Set()

    function subscribeScenePrompts(listener) {
      scenePromptListeners.add(listener)
      return () => {
        scenePromptListeners.delete(listener)
      }
    }

    function getScenePromptsSnapshot() {
      return userScenePrompts
    }

    function setUserScenePrompt(sceneKey, text) {
      const key = scenePromptKey(sceneKey)
      if (!key.startsWith('user:')) return { ok: false, code: 'invalid' }
      const trimmed = typeof text === 'string' ? text.trim() : ''
      if (trimmed.length > SCENE_PROMPT_MAX) return { ok: false, code: 'too-long' }
      const next = { ...userScenePrompts }
      if (trimmed === '') delete next[key]
      else next[key] = trimmed
      const persisted = persistScenePrompts(next)
      userScenePrompts = next
      for (const listener of [...scenePromptListeners]) listener()
      return persisted ? { ok: true } : { ok: false, code: 'storage' }
    }

    function moveUserScenePrompt(oldKey, nextKey) {
      const from = scenePromptKey(oldKey)
      const to = scenePromptKey(nextKey)
      if (!from.startsWith('user:') || !to.startsWith('user:') || from === to) return
      if (userScenePrompts[from] === undefined) return
      const next = { ...userScenePrompts }
      next[to] = next[from]
      delete next[from]
      if (!persistScenePrompts(next)) return
      userScenePrompts = next
      for (const listener of [...scenePromptListeners]) listener()
    }

    function removeUserScenePrompt(sceneKey) {
      const key = scenePromptKey(sceneKey)
      if (!key.startsWith('user:') || userScenePrompts[key] === undefined) return
      const next = { ...userScenePrompts }
      delete next[key]
      if (!persistScenePrompts(next)) return
      userScenePrompts = next
      for (const listener of [...scenePromptListeners]) listener()
    }

    function scenePromptFor(sceneKey) {
      const key = scenePromptKey(sceneKey)
      if (key.startsWith('user:')) return userScenePrompts[key] || ''
      return ''
    }


    /** Validate a generated scene object after JSON parsing. */
    function normalizeGeneratedScene(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return { ok: false, code: 'schema' }
      }
      if (value.version !== undefined && value.version !== 1) return { ok: false, code: 'version' }
      const rawScene = value.scene
      if (rawScene === null || typeof rawScene !== 'object' || Array.isArray(rawScene)) {
        return { ok: false, code: 'schema' }
      }
      const name = typeof rawScene.name === 'string' ? rawScene.name.trim() : ''
      if (name === '' || name.length > GENERATED_SCENE_NAME_MAX) return { ok: false, code: 'name' }
      const systemPrompt = typeof rawScene.systemPrompt === 'string' ? rawScene.systemPrompt.trim() : ''
      if (systemPrompt === '' || systemPrompt.length > SCENE_PROMPT_MAX) {
        return { ok: false, code: 'systemPrompt' }
      }
      if (!Array.isArray(rawScene.templates) || rawScene.templates.length < 1 || rawScene.templates.length > GENERATED_TEMPLATE_MAX) {
        return { ok: false, code: 'templates' }
      }
      const templates = []
      for (const rawCard of rawScene.templates) {
        if (rawCard === null || typeof rawCard !== 'object' || Array.isArray(rawCard)) {
          return { ok: false, code: 'schema' }
        }
        const title = typeof rawCard.title === 'string' ? rawCard.title.trim() : ''
        if (title === '' || title.length > GENERATED_CARD_TITLE_MAX) return { ok: false, code: 'title' }
        const body = typeof rawCard.body === 'string' ? rawCard.body.trim() : ''
        if (body === '' || body.length > GENERATED_CARD_BODY_MAX) return { ok: false, code: 'body' }
        templates.push({ title, body })
      }
      return { ok: true, scene: { name, systemPrompt, templates } }
    }

    /** Parse a JSON object even when a model wraps it in prose or a code fence. */
    function parseGeneratedScene(text) {
      if (typeof text !== 'string' || text.trim() === '') return { ok: false, code: 'empty' }
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start < 0 || end <= start) return { ok: false, code: 'json' }
      let parsed
      try {
        parsed = JSON.parse(text.slice(start, end + 1))
      } catch (_invalidJson) {
        return { ok: false, code: 'json' }
      }
      return normalizeGeneratedScene(parsed)
    }

    /**
     * Append a generated package as a custom scene. All three storage keys are
     * written before in-memory state changes; if any write fails, previous values
     * are restored and no partial scene is exposed.
     */
    function importGeneratedScene(scene, t, options) {
      const normalized = normalizeGeneratedScene({ version: 1, scene })
      if (!normalized.ok) return normalized
      const value = normalized.scene
      const name = value.name
      const allowUpdate = options !== null && typeof options === 'object' && options.update === true
      const existing = categoriesOf(buildItems(t), userCategories, t).find(
        (entry) => entry.label.toLowerCase() === name.toLowerCase(),
      )
      let sceneName = name
      let updated = false
      if (existing !== undefined) {
        if (!existing.key.startsWith('user:')) return { ok: false, code: 'duplicate' }
        if (!allowUpdate) return { ok: false, code: 'exists' }
        sceneName = existing.label
        updated = true
      }
      const reserved = new Set(
        BUILTIN_CATEGORY_IDS.map((id) => EN[`category.${id}`])
          .concat(BUILTIN_CATEGORY_IDS.map((id) => ZH[`category.${id}`]))
          .filter((label) => typeof label === 'string')
          .map((label) => label.toLowerCase()),
      )
      if (existing === undefined && reserved.has(name.toLowerCase())) return { ok: false, code: 'duplicate' }

      const now = Date.now()
      const templates = value.templates.map((card, index) => ({
        id: newId(),
        title: card.title,
        body: card.body,
        category: sceneName,
        updatedAt: now - index,
        order: index,
      }))
      const untouchedTemplates = updated
        ? userTemplates.filter((template) => templateCategoryKey(template.category) !== templateCategoryKey(sceneName))
        : userTemplates
      const nextTemplates = [...templates, ...untouchedTemplates]
      const nextCategories = updated ? userCategories : [...userCategories, sceneName]
      const promptKey = `user:${sceneName.toLowerCase()}`
      const nextScenePrompts = { ...userScenePrompts, [promptKey]: value.systemPrompt }
      const writes = [
        [STORAGE_KEY, JSON.stringify(nextTemplates)],
        [CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories)],
        [SCENE_PROMPT_STORAGE_KEY, JSON.stringify(nextScenePrompts)],
      ]
      const backups = writes.map(([key]) => {
        try {
          return { key, value: window.localStorage.getItem(key) }
        } catch (error) {
          return { key, value: null, error }
        }
      })
      const written = []
      try {
        for (const [key, value] of writes) {
          window.localStorage.setItem(key, value)
          written.push(key)
        }
      } catch (error) {
        console.error('prompt-library: could not import generated scene', error)
        for (const entry of backups) {
          if (!written.includes(entry.key)) continue
          try {
            if (entry.value === null) window.localStorage.removeItem(entry.key)
            else window.localStorage.setItem(entry.key, entry.value)
          } catch (restoreError) {
            console.error('prompt-library: could not restore generated scene backup', restoreError)
          }
        }
        return { ok: false, code: 'storage' }
      }

      userTemplates = nextTemplates
      userCategories = nextCategories
      userScenePrompts = nextScenePrompts
      for (const listener of [...templateListeners]) listener()
      for (const listener of [...categoryListeners]) listener()
      for (const listener of [...scenePromptListeners]) listener()
      return { ok: true, sceneKey: `user:${sceneName}`, updated }
    }

    function normalizeSceneSelection(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
      const next = {}
      for (const [sessionId, rawKey] of Object.entries(value)) {
        if (typeof sessionId !== 'string' || sessionId === '') continue
        const key = sceneSelectionKey(rawKey)
        if (key === '') continue
        next[sessionId] = key
      }
      return next
    }

    function loadSceneSelection() {
      try {
        const raw = window.localStorage.getItem(SCENE_SELECTION_STORAGE_KEY)
        if (raw === null) return {}
        return normalizeSceneSelection(JSON.parse(raw))
      } catch (error) {
        console.error('prompt-library: could not read scene selection', error)
        return {}
      }
    }

    function persistSceneSelection(next) {
      try {
        window.localStorage.setItem(SCENE_SELECTION_STORAGE_KEY, JSON.stringify(next))
        return true
      } catch (error) {
        console.error('prompt-library: could not save scene selection', error)
        return false
      }
    }

    let sceneSelection = loadSceneSelection()
    const sceneSelectionListeners = new Set()

    function subscribeSceneSelection(listener) {
      sceneSelectionListeners.add(listener)
      return () => {
        sceneSelectionListeners.delete(listener)
      }
    }

    function getSceneSelectionSnapshot() {
      return sceneSelection
    }

    function getSceneSelection(sessionId) {
      return typeof sessionId === 'string' ? sceneSelection[sessionId] || '' : ''
    }

    function setSceneSelection(sessionId, sceneKey) {
      if (typeof sessionId !== 'string' || sessionId === '') return false
      const key = sceneSelectionKey(sceneKey)
      const next = { ...sceneSelection }
      if (key === '') delete next[sessionId]
      else next[sessionId] = key
      const persisted = persistSceneSelection(next)
      sceneSelection = next
      for (const listener of [...sceneSelectionListeners]) listener()
      return persisted
    }

    function renameSceneSelection(oldKey, nextKey) {
      const from = sceneSelectionKey(oldKey)
      const to = sceneSelectionKey(nextKey)
      if (from === '' || to === '' || from === to) return
      let changed = false
      const next = {}
      for (const [sessionId, key] of Object.entries(sceneSelection)) {
        const mapped = key === from ? to : key
        if (mapped !== key) changed = true
        next[sessionId] = mapped
      }
      if (!changed) return
      if (!persistSceneSelection(next)) return
      sceneSelection = next
      for (const listener of [...sceneSelectionListeners]) listener()
    }

    function removeSceneSelectionByKey(sceneKey) {
      const key = sceneSelectionKey(sceneKey)
      if (key === '') return
      let changed = false
      const next = {}
      for (const [sessionId, selected] of Object.entries(sceneSelection)) {
        if (selected === key) changed = true
        else next[sessionId] = selected
      }
      if (!changed) return
      if (!persistSceneSelection(next)) return
      sceneSelection = next
      for (const listener of [...sceneSelectionListeners]) listener()
    }

    function subscribeTemplates(listener) {
      templateListeners.add(listener)
      return () => {
        templateListeners.delete(listener)
      }
    }

    function getTemplatesSnapshot() {
      return userTemplates
    }

    function setUserTemplates(next) {
      userTemplates = next
      persistTemplates(next)
      for (const listener of [...templateListeners]) listener()
    }

    function nextTemplateOrder(category) {
      const key = templateCategoryKey(category)
      return (
        userTemplates
          .filter((template) => templateCategoryKey(template.category) === key)
          .reduce((max, template) => Math.max(max, typeof template.order === 'number' ? template.order : -1), -1) + 1
      )
    }

    function createTemplate(input) {
      const template = {
        id: newId(),
        title: input.title,
        body: input.body,
        category: input.category,
        updatedAt: Date.now(),
        order: nextTemplateOrder(input.category),
      }
      setUserTemplates([template, ...userTemplates])
    }

    function updateTemplate(id, patch) {
      const existing = userTemplates.find((template) => template.id === id)
      if (existing === undefined) return
      const nextCategory = typeof patch.category === 'string' ? patch.category : existing.category
      const categoryChanged = templateCategoryKey(nextCategory) !== templateCategoryKey(existing.category)
      const order = categoryChanged ? nextTemplateOrder(nextCategory) : existing.order
      setUserTemplates(
        userTemplates.map((template) =>
          template.id === id
            ? { ...template, ...patch, category: nextCategory, order, updatedAt: Date.now() }
            : template,
        ),
      )
    }

    function deleteTemplate(id) {
      setUserTemplates(userTemplates.filter((template) => template.id !== id))
    }

    function builtinCategoryForLabel(label, t) {
      const needle = label.trim().toLowerCase()
      if (needle === '') return null
      for (const id of BUILTIN_CATEGORY_IDS) {
        if (t(`category.${id}`).toLowerCase() === needle) return id
      }
      return null
    }

    function resolveUserCategory(rawCategory, t) {
      const name = rawCategory.trim()
      if (name === '') return { key: 'user:', label: t('category.uncategorized') }
      const existing = userCategories.find((entry) => entry.toLowerCase() === name.toLowerCase())
      if (existing !== undefined) return { key: `user:${existing}`, label: existing }
      const builtin = builtinCategoryForLabel(name, t)
      if (builtin !== null) return { key: `builtin:${builtin}`, label: t(`category.${builtin}`) }
      return { key: `user:${name}`, label: name }
    }

    function ensureUserCategory(name, t) {
      const trimmed = name.trim()
      if (trimmed === '') return null
      const existing = userCategories.find((entry) => entry.toLowerCase() === trimmed.toLowerCase())
      if (existing !== undefined) return `user:${existing}`
      const builtin = builtinCategoryForLabel(trimmed, t)
      if (builtin !== null) return `builtin:${builtin}`
      setUserCategories([...userCategories, trimmed])
      return `user:${trimmed}`
    }

    /**
     * Merge built-ins and user templates into the display model.
     * Category keys are prefixed so an existing user category keeps its own key
     * even when its label matches one of the built-in categories.
     */
    function buildItems(t) {
      const items = []
      for (const preset of BUILTINS) {
        items.push({
          id: `builtin:${preset.id}`,
          builtin: true,
          title: preset.title,
          body: preset.body,
          description: preset.description,
          systemPrompt: preset.systemPrompt,
          mode: preset.mode,
          categoryKey: `builtin:${preset.category}`,
          categoryLabel: t(`category.${preset.category}`),
          rawCategory: '',
          generator: preset.category === 'meta',
        })
      }
      const ordered = [...userTemplates].sort((left, right) => right.updatedAt - left.updatedAt)
      for (const template of ordered) {
        const category = resolveUserCategory(template.category, t)
        items.push({
          id: template.id,
          builtin: false,
          title: template.title,
          body: template.body,
          categoryKey: category.key,
          categoryLabel: category.label,
          rawCategory: template.category,
          updatedAt: template.updatedAt,
          order: template.order,
        })
      }
      return items
    }

    /** Scene cards: built-ins keep their authored order; user cards follow scene order. */
    function sceneCardsFor(items, categoryKey) {
      const builtins = items.filter((item) => item.builtin && item.categoryKey === categoryKey)
      const mine = items
        .filter((item) => !item.builtin && item.categoryKey === categoryKey)
        .sort((left, right) => {
          const leftOrder = typeof left.order === 'number' ? left.order : 0
          const rightOrder = typeof right.order === 'number' ? right.order : 0
          return leftOrder - rightOrder || left.updatedAt - right.updatedAt
        })
      return [...builtins, ...mine]
    }

    function filterItems(items, query, categoryKey) {
      const needle = query.trim().toLowerCase()
      return items.filter((item) => {
        if (categoryKey !== 'all' && item.categoryKey !== categoryKey) return false
        if (needle === '') return true
        return (
          item.title.toLowerCase().includes(needle) ||
          item.body.toLowerCase().includes(needle) ||
          item.categoryLabel.toLowerCase().includes(needle)
        )
      })
    }

    function categoriesOf(items, explicitCategories, t) {
      const seen = new Map()
      for (const item of items) {
        if (!seen.has(item.categoryKey)) seen.set(item.categoryKey, item.categoryLabel)
      }
      for (const name of explicitCategories) {
        if (name.trim() === '') continue
        if (builtinCategoryForLabel(name, t) !== null) continue
        const key = `user:${name}`
        if (!seen.has(key)) seen.set(key, name)
      }
      const builtinOrder = new Map(BUILTIN_CATEGORY_IDS.map((id, index) => [`builtin:${id}`, index]))
      return [...seen]
        .map(([key, label]) => ({ key, label }))
        .sort((left, right) => {
          const leftOrder = builtinOrder.has(left.key) ? builtinOrder.get(left.key) : Number.MAX_SAFE_INTEGER
          const rightOrder = builtinOrder.has(right.key) ? builtinOrder.get(right.key) : Number.MAX_SAFE_INTEGER
          return leftOrder - rightOrder || left.label.localeCompare(right.label)
        })
    }

    // #endregion

    // #region Composer picker and pending insertion ------------------------------

    let pickerOpen = false
    const pickerListeners = new Set()

    function subscribePicker(listener) {
      pickerListeners.add(listener)
      return () => {
        pickerListeners.delete(listener)
      }
    }

    function getPickerSnapshot() {
      return pickerOpen
    }

    function setPickerOpen(next) {
      if (pickerOpen === next) return
      pickerOpen = next
      for (const listener of [...pickerListeners]) listener()
    }

    function togglePicker() {
      setPickerOpen(!pickerOpen)
    }

    let pendingInsertion = null
    let insertionNonce = 0
    const insertionListeners = new Set()

    function subscribeInsertion(listener) {
      insertionListeners.add(listener)
      return () => {
        insertionListeners.delete(listener)
      }
    }

    function notifyInsertion() {
      for (const listener of [...insertionListeners]) listener()
    }

    /** Queue a template body for the mounted composer; it inserts once the composer is reachable. */
    function requestInsertion(text) {
      if (typeof text !== 'string' || text === '') return
      pendingInsertion = { text, at: Date.now(), nonce: (insertionNonce += 1), retried: false }
      notifyInsertion()
    }

    function clearInsertion(nonce) {
      if (pendingInsertion !== null && pendingInsertion.nonce === nonce) {
        pendingInsertion = null
        notifyInsertion()
      }
    }

    // #endregion

    // #region Icons ---------------------------------------------------------------

    function TemplateIcon({ size = 16 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M6.5 4.25h11a1.75 1.75 0 0 1 1.75 1.75v14.5l-7.25-4.35L4.75 20.5V6A1.75 1.75 0 0 1 6.5 4.25Z' }),
        h('path', { d: 'M9.25 8.5h5.5M9.25 12h3.75' }),
      )
    }

    function SearchIcon({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('circle', { cx: 11, cy: 11, r: 6.5 }),
        h('path', { d: 'm16 16 4.5 4.5' }),
      )
    }

    function PlusIcon({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M12 5v14M5 12h14' }),
      )
    }

    function ArrowLeftIcon({ size = 16 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M19 12H5M11 6l-6 6 6 6' }),
      )
    }

    function CloseIcon({ size = 12 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M6 6l12 12M18 6 6 18' }),
      )
    }

    /** Decorative sidebar glyph; the sidebar owns the button label and accessible name. */
    function PromptLibraryIcon({ size = 16 }) {
      return h(TemplateIcon, { size })
    }

    // #endregion

    // #region Styles --------------------------------------------------------------

    const PAGE_CSS = `
.dsh-pl-page{width:100%;min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6;display:flex;overflow:hidden}
.dsh-pl-scroll{scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;flex:1;min-height:0;overflow:auto}
.dsh-pl-content{max-width:960px;margin:0 auto;padding:0 clamp(24px,4vw,48px) 56px}
.dsh-pl-heading{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:28px;display:flex}
[data-platform="darwin"] .dsh-pl-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dsh-pl-heading-text{min-width:0}
.dsh-pl-heading h1{flex:0 auto;min-width:0;max-width:100%;margin:0;font-size:20px;font-weight:500;line-height:28px}
.dsh-pl-subtitle{max-width:640px;margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dsh-pl-heading-actions{white-space:nowrap;flex:none;align-items:center;gap:8px;display:flex}
.dsh-pl-btn{appearance:none;box-sizing:border-box;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:5px 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:background-color .12s ease,border-color .12s ease,color .12s ease}
.dsh-pl-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-btn:disabled{opacity:.5;cursor:default}
.dsh-pl-btn-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border-color:transparent}
.dsh-pl-btn-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(.95)}
.dsh-pl-btn-outline{border-color:var(--dsw-alias-border-l1)}
.dsh-pl-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-btn-sm{padding:3px 8px;font-size:12.5px;line-height:18px}
.dsh-pl-icon-btn{appearance:none;box-sizing:border-box;width:30px;height:30px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dsh-pl-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-icon-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-notice{margin:16px 0 -4px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:18px}
.dsh-pl-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-generator{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}
.dsh-pl-generator-main{display:flex;align-items:flex-start;gap:10px;min-width:0}
.dsh-pl-generator-icon{flex:none;width:30px;height:30px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);display:flex;align-items:center;justify-content:center}
.dsh-pl-generator-copy{min-width:0}
.dsh-pl-generator-title{margin:0;font-size:13px;font-weight:600;line-height:20px}
.dsh-pl-generator-hint{margin:2px 0 0;max-width:560px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-generator-actions{flex:none;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dsh-pl-toolbar{display:flex;flex-direction:column;align-items:stretch;gap:10px;margin:18px 0 24px}
.dsh-pl-toolbar-main{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dsh-pl-toolbar-actions{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.dsh-pl-search{position:relative;flex:1 1 240px;min-width:200px;max-width:none}
.dsh-pl-search>svg{position:absolute;left:9px;top:50%;color:var(--dsw-alias-label-secondary);pointer-events:none;transform:translateY(-50%)}
.dsh-pl-search input{box-sizing:border-box;width:100%;height:32px;padding:0 30px 0 30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;transition:border-color .12s ease}
.dsh-pl-search input::placeholder{color:var(--dsw-alias-label-secondary);opacity:1}
.dsh-pl-search input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-search input[type="search"]::-webkit-search-cancel-button{display:none}
.dsh-pl-search-clear{position:absolute;right:4px;top:50%;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transform:translateY(-50%)}
.dsh-pl-search-clear:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-chips{flex-wrap:nowrap;align-items:center;gap:4px;display:flex;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-label-secondary) transparent;padding:1px 1px 5px}
.dsh-pl-chips::-webkit-scrollbar{height:6px}
.dsh-pl-chips::-webkit-scrollbar-thumb{background:var(--dsw-alias-label-secondary);border-radius:999px}
.dsh-pl-chips::-webkit-scrollbar-track{background:transparent}
.dsh-pl-chip{appearance:none;border:1px solid transparent;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:3px 10px;cursor:pointer;transition:background-color .12s ease,color .12s ease,border-color .12s ease}
.dsh-pl-chip:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-chip[data-active="true"]{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}
.dsh-pl-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-chip-add{display:inline-flex;align-items:center;gap:4px;border-style:dashed;border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}
.dsh-pl-chip-add:hover{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-count{margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.dsh-pl-section{margin-top:26px}
.dsh-pl-section:first-of-type{margin-top:0}
.dsh-pl-section-head{flex-wrap:wrap;align-items:baseline;gap:8px;margin-bottom:12px;display:flex}
.dsh-pl-section-head h2{margin:0;font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-section-count{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-section-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;display:grid}
.dsh-pl-card{min-width:0;padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;gap:8px;transition:border-color .12s ease}
.dsh-pl-card:hover{border-color:var(--dsw-alias-border-l2)}
.dsh-pl-card-head{align-items:flex-start;justify-content:space-between;gap:8px;display:flex}
.dsh-pl-card-title{min-width:0;margin:0;font-size:14px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-badge{flex:none;padding:1px 7px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;white-space:nowrap}
.dsh-pl-preview{min-height:58px;margin:0;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.dsh-pl-card-actions{flex-wrap:wrap;align-items:center;gap:2px;margin-top:auto;display:flex}
.dsh-pl-confirm-text{flex:1 1 100%;margin-bottom:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-empty{text-align:center;padding:30px 20px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-empty-title{margin:0;font-size:13px;font-weight:500;line-height:20px;color:var(--dsw-alias-label-primary)}
.dsh-pl-empty-body{max-width:520px;margin:6px auto 0;font-size:12.5px;line-height:19px}
.dsh-pl-empty-action{margin-top:12px}
.dsh-pl-backdrop{position:fixed;inset:0;z-index:1000;padding:24px;background:rgba(0,0,0,.36);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-pl-dialog{box-sizing:border-box;width:min(680px,calc(100vw - 48px));max-height:calc(100vh - 48px);padding:22px;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-prominent,0 18px 48px rgba(0,0,0,.24));display:flex;flex-direction:column;gap:14px;overflow:auto}
.dsh-pl-dialog-title{margin:0;font-size:17px;font-weight:500;line-height:24px}
.dsh-pl-dialog-sm{width:min(440px,calc(100vw - 48px))}
.dsh-pl-field{display:flex;flex-direction:column;gap:6px}
.dsh-pl-field label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px}
.dsh-pl-field input,.dsh-pl-field textarea{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:7px 10px;transition:border-color .12s ease}
.dsh-pl-field input:focus,.dsh-pl-field textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-field textarea{min-height:220px;max-height:50vh;resize:vertical;line-height:1.6}
.dsh-pl-form-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12.5px;line-height:18px}
.dsh-pl-dialog-foot{flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;display:flex}
.dsh-pl-hint{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:18px}
.dsh-pl-dialog-actions{gap:6px;display:flex}
.dsh-pl-import-dialog{width:min(760px,calc(100vw - 48px))}
.dsh-pl-import-textarea{box-sizing:border-box;width:100%;min-height:120px;max-height:28vh;resize:vertical;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:1.55;padding:8px 10px}
.dsh-pl-import-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-import-preview{display:flex;flex-direction:column;gap:10px;max-height:42vh;overflow:auto;padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base)}
.dsh-pl-import-block{display:flex;flex-direction:column;gap:5px}
.dsh-pl-import-block h3{margin:0;font-size:12px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-import-system{margin:0;max-height:140px;overflow:auto;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.55}
.dsh-pl-import-card{padding:8px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.dsh-pl-import-card strong{font-size:12.5px;line-height:18px}
.dsh-pl-import-card p{margin:4px 0 0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5}
.dsh-pl-import-update{display:flex;align-items:flex-start;gap:7px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-import-update input{margin:3px 0 0;flex:none}
.dsh-pl-import-success{margin:0;color:var(--dsw-alias-state-success-primary);font-size:12.5px;line-height:18px}
.dsh-pl-scene-manager{display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow:auto;padding:0 2px}
.dsh-pl-scene-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base)}
.dsh-pl-scene-row-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:2px}
.dsh-pl-scene-row-name{font-size:13px;font-weight:500;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-scene-row-meta{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.dsh-pl-scene-row-actions{flex:none;display:flex;align-items:center;gap:2px;flex-wrap:wrap;justify-content:flex-end}
.dsh-pl-scene-prompt-editor{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base)}
.dsh-pl-scene-prompt-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-pl-scene-prompt-head h3{margin:0;font-size:13px;font-weight:600;line-height:20px}
.dsh-pl-scene-prompt-editor textarea{box-sizing:border-box;width:100%;min-height:120px;max-height:40vh;resize:vertical;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:1.55;padding:8px 10px}
.dsh-pl-scene-prompt-editor textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-scene-prompt-editor textarea[readonly]{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-scene-edit{min-width:0;flex:1;display:flex;align-items:center;gap:6px}
.dsh-pl-scene-edit input{box-sizing:border-box;min-width:0;flex:1;height:30px;padding:4px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:18px}
.dsh-pl-scene-edit input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-scene-confirm{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px}
.dsh-pl-scene-manager-empty{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
@media (max-width:640px){.dsh-pl-grid{grid-template-columns:1fr}.dsh-pl-generator{flex-direction:column;align-items:stretch}.dsh-pl-generator-actions{justify-content:flex-end}.dsh-pl-toolbar-main{align-items:stretch}.dsh-pl-search{flex-basis:100%}.dsh-pl-toolbar-actions{width:100%;justify-content:flex-end}.dsh-pl-count{margin-left:0;text-align:right}.dsh-pl-heading-actions{width:100%;justify-content:flex-end}.dsh-pl-scene-row{flex-wrap:wrap}.dsh-pl-scene-row-actions{width:100%;justify-content:flex-end}}
@media (prefers-reduced-motion:reduce){.dsh-pl-page *{transition:none!important}}
`

    const PICKER_CSS = `
.dsh-pl-trigger-btn{appearance:none;box-sizing:border-box;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dsh-pl-trigger-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-trigger-btn[aria-expanded="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-trigger-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-pop{position:absolute;bottom:calc(100% + 6px);left:0;z-index:100;box-sizing:border-box;width:min(380px,100%);max-height:min(430px,calc(100vh - 170px));border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 16px 40px rgba(0,0,0,.2));display:flex;flex-direction:column;overflow:hidden}
.dsh-pl-pop-backdrop{position:fixed;inset:0;z-index:1000;padding:24px;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-pl-pop-modal{position:relative;bottom:auto;left:auto;width:min(520px,calc(100vw - 48px));max-height:min(560px,calc(100vh - 96px));box-shadow:var(--dsw-elevation-prominent,0 24px 64px rgba(0,0,0,.28))}
.dsh-pl-pop-head{flex:none;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsh-pl-pop-title{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600;line-height:18px}
.dsh-pl-pop-search{position:relative;margin-top:8px}
.dsh-pl-pop-search>svg{position:absolute;left:9px;top:50%;color:var(--dsw-alias-label-secondary);pointer-events:none;transform:translateY(-50%)}
.dsh-pl-pop-search input{box-sizing:border-box;width:100%;height:30px;padding:0 10px 0 30px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:18px}
.dsh-pl-pop-search input::placeholder{color:var(--dsw-alias-label-secondary);opacity:1}
.dsh-pl-pop-search input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsh-pl-pop-list{flex:1;min-height:0;padding:6px;overflow:auto;scrollbar-gutter:stable}
.dsh-pl-pop-item{appearance:none;box-sizing:border-box;width:100%;padding:7px 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;display:flex;flex-direction:column;gap:1px;cursor:pointer}
.dsh-pl-pop-item:hover,.dsh-pl-pop-item[data-active="true"]{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-pop-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-pl-pop-item-title{font-size:13px;line-height:19px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-pop-item-meta{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-pop-empty{padding:22px 12px;color:var(--dsw-alias-label-secondary);font-size:12.5px;text-align:center}
.dsh-pl-pop-error{padding:6px 12px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-pl-pop-flash{padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-pop-flash[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-pop-foot{flex:none;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:18px}
.dsh-pl-pop-manage{appearance:none;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11.5px;line-height:18px;padding:2px 5px;cursor:pointer}
.dsh-pl-pop-manage:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-pop-manage:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dsh-pl-flash{position:absolute;bottom:calc(100% + 8px);left:12px;z-index:99;box-sizing:border-box;max-width:min(360px,calc(100vw - 32px));padding:6px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.18));color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px}
.dsh-pl-flash[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-flash-fixed{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:1001}
@media (prefers-reduced-motion:reduce){.dsh-pl-trigger-btn{transition:none!important}}
`

    const SCENE_CSS = `
.dsh-pl-scenes{box-sizing:border-box;width:100%;max-width:960px;margin:0 auto 8px;color:var(--dsw-alias-label-primary);font-family:inherit}
.dsh-pl-scenes-tabs{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:4px;margin:0 0 10px;padding:1px 1px 5px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-label-secondary) transparent}
.dsh-pl-scenes-tabs::-webkit-scrollbar{height:6px}
.dsh-pl-scenes-tabs::-webkit-scrollbar-thumb{background:var(--dsw-alias-label-secondary);border-radius:999px}
.dsh-pl-scenes-tabs::-webkit-scrollbar-track{background:transparent}
.dsh-pl-scene-tab{flex:none;appearance:none;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:14px;line-height:20px;padding:3px 8px;cursor:pointer}
.dsh-pl-scene-tab:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pl-scene-tab[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base)}
.dsh-pl-scene-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-scene-carousel{position:relative;min-width:0}
.dsh-pl-scene-grid{display:flex;gap:9px;overflow-x:hidden;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;padding:1px 1px 4px}
.dsh-pl-scene-grid[data-overflow="true"]{overflow-x:auto;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-label-secondary) transparent;padding-bottom:8px}
.dsh-pl-scene-grid[data-overflow="true"]::-webkit-scrollbar{height:6px}
.dsh-pl-scene-grid[data-overflow="true"]::-webkit-scrollbar-thumb{background:var(--dsw-alias-label-secondary);border-radius:999px}
.dsh-pl-scene-grid[data-overflow="true"]::-webkit-scrollbar-track{background:transparent}
.dsh-pl-scene-card{box-sizing:border-box;appearance:none;display:flex;flex:0 0 calc((100% - 36px) / 5);flex-direction:column;align-items:flex-start;gap:4px;min-width:0;text-align:left;border:1px solid var(--dsw-alias-border-l1);border-radius:11px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;padding:10px 11px;cursor:pointer;scroll-snap-align:start;transition:background-color .14s ease,border-color .14s ease}
.dsh-pl-scene-grid[data-overflow="true"] .dsh-pl-scene-card{flex-basis:calc((100% - 36px - 30px) / 5)}
.dsh-pl-scene-peek{position:absolute;top:0;right:0;bottom:8px;width:30px;pointer-events:none;border-radius:0 11px 11px 0;background:linear-gradient(90deg, transparent, var(--dsw-alias-bg-layer-1) 65%);opacity:.7;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);border-right:1px solid var(--dsw-alias-border-l1);z-index:1}
.dsh-pl-scene-card:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-secondary)}
.dsh-pl-scene-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pl-scene-head{display:flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.dsh-pl-scene-icon{flex:none;font-size:16px;line-height:1;color:var(--dsw-alias-label-secondary)}
.dsh-pl-scene-title{min-width:0;max-width:100%;font-size:13px;font-weight:600;line-height:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-pl-scene-desc{display:-webkit-box;max-width:100%;min-height:30px;font-size:11px;line-height:15px;color:var(--dsw-alias-label-secondary);overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.dsh-pl-scenes-notice{margin:8px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsh-pl-scenes-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.dsh-pl-scenes-empty{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dsh-pl-scenes-empty p{margin:0}
.dsh-pl-scenes-link{appearance:none;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11.5px;line-height:18px;padding:3px 6px;cursor:pointer}
.dsh-pl-scenes-link:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-pl-scenes-link:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.dsh-pl-scene-grid{scroll-snap-type:none}}
@media (prefers-reduced-motion:reduce){.dsh-pl-scene-card{transition:none!important}}
`

    // #endregion

    // #region Components ----------------------------------------------------------

    function TemplateCard({ item, t, confirming, onInsert, onCopy, onDuplicate, onEdit, onAskDelete, onDelete, onCancelDelete }) {
      return h(
        'article',
        { className: 'dsh-pl-card' },
        h(
          'div',
          { className: 'dsh-pl-card-head' },
          h('h3', { className: 'dsh-pl-card-title', title: item.title }, item.title),
          item.categoryLabel ? h('span', { className: 'dsh-pl-badge' }, item.categoryLabel) : null,
        ),
        h('p', { className: 'dsh-pl-preview', title: item.body }, item.body),
        confirming
          ? h(
              'div',
              { className: 'dsh-pl-card-actions' },
              h('span', { className: 'dsh-pl-confirm-text' }, t('confirm.delete')),
              h(
                'button',
                { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger', onClick: onDelete },
                t('action.confirmDelete'),
              ),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onCancelDelete }, t('action.cancel')),
            )
          : h(
              'div',
              { className: 'dsh-pl-card-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-primary',
                  onClick: onInsert,
                },
                t('action.insert'),
              ),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onCopy }, t('action.copy')),
              item.builtin
                ? h(
                    'button',
                    { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onDuplicate },
                    t('action.duplicate'),
                  )
                : h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: onEdit }, t('action.edit')),
              item.builtin
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger',
                      onClick: onAskDelete,
                    },
                    t('action.delete'),
                  ),
            ),
      )
    }

    function EditorDialog({ t, editor, categories, onChange, onSave, onClose }) {
      const dialogRef = React.useRef(null)
      const titleRef = React.useRef(null)

      React.useEffect(() => {
        const previous = document.activeElement
        const input = titleRef.current
        if (input !== null && typeof input.focus === 'function') {
          input.focus()
          if (typeof input.select === 'function') input.select()
        }
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      const onKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          return
        }
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          onSave()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-dialog-title',
            onKeyDown,
          },
          h('h2', { id: 'dsh-pl-dialog-title', className: 'dsh-pl-dialog-title' }, t(editor.mode === 'edit' ? 'dialog.edit' : 'dialog.create')),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-title' }, t('form.title')),
            h('input', {
              id: 'dsh-pl-title',
              ref: titleRef,
              type: 'text',
              value: editor.title,
              placeholder: t('form.titlePlaceholder'),
              onChange: (event) => onChange({ title: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-category' }, t('form.category')),
            h('input', {
              id: 'dsh-pl-category',
              type: 'text',
              value: editor.category,
              placeholder: t('form.categoryPlaceholder'),
              list: 'dsh-pl-category-options',
              onChange: (event) => onChange({ category: event.target.value }),
            }),
            h(
              'datalist',
              { id: 'dsh-pl-category-options' },
              categories.map((label) => h('option', { key: label, value: label })),
            ),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-body' }, t('form.body')),
            h('textarea', {
              id: 'dsh-pl-body',
              value: editor.body,
              placeholder: t('form.bodyPlaceholder'),
              onChange: (event) => onChange({ body: event.target.value }),
            }),
          ),
          editor.error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, editor.error) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }, t('form.hint')),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: onSave }, t('action.save')),
            ),
          ),
        ),
      )
    }

    function CategoryDialog({ t, editor, onChange, onSave, onClose }) {
      const dialogRef = React.useRef(null)
      const inputRef = React.useRef(null)

      React.useEffect(() => {
        const previous = document.activeElement
        const input = inputRef.current
        if (input !== null && typeof input.focus === 'function') input.focus()
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      const onKeyDown = (event) => {
        if (event.nativeEvent && event.nativeEvent.isComposing) return
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog dsh-pl-dialog-sm',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-category-dialog-title',
            onKeyDown,
          },
          h(
            'h2',
            { id: 'dsh-pl-category-dialog-title', className: 'dsh-pl-dialog-title' },
            t('dialog.category'),
          ),
          h(
            'div',
            { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-category-name' }, t('form.category')),
            h('input', {
              id: 'dsh-pl-category-name',
              ref: inputRef,
              type: 'text',
              maxLength: 40,
              value: editor.name,
              placeholder: t('form.categoryPlaceholder'),
              onChange: (event) => onChange({ name: event.target.value }),
              onKeyDown: (event) => {
                if (event.nativeEvent && event.nativeEvent.isComposing) return
                if (event.key !== 'Enter') return
                event.preventDefault()
                onSave()
              },
            }),
          ),
          editor.error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, editor.error) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
              h('button', { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: onSave }, t('action.save')),
            ),
          ),
        ),
      )
    }

    function SceneManagerDialog({ t, scenes, onRename, onDelete, onSaveSystemPrompt, onClose }) {
      const dialogRef = React.useRef(null)
      const closeRef = React.useRef(null)
      const renameRef = React.useRef(null)
      const promptRef = React.useRef(null)
      const [editingKey, setEditingKey] = React.useState(null)
      const [draftName, setDraftName] = React.useState('')
      const [error, setError] = React.useState(null)
      const [confirmKey, setConfirmKey] = React.useState(null)
      const [promptKey, setPromptKey] = React.useState(null)
      const [promptDraft, setPromptDraft] = React.useState('')
      const [promptError, setPromptError] = React.useState(null)

      React.useEffect(() => {
        const previous = document.activeElement
        if (closeRef.current !== null) closeRef.current.focus()
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      React.useEffect(() => {
        if (editingKey === null || renameRef.current === null) return
        renameRef.current.focus()
        if (typeof renameRef.current.select === 'function') renameRef.current.select()
      }, [editingKey])

      React.useEffect(() => {
        if (promptKey === null || promptRef.current === null) return
        promptRef.current.focus()
      }, [promptKey])

      const startRename = (scene) => {
        setEditingKey(scene.key)
        setDraftName(scene.label)
        setConfirmKey(null)
        setPromptKey(null)
        setError(null)
      }

      const openPrompt = (scene) => {
        setEditingKey(null)
        setConfirmKey(null)
        setPromptKey(scene.key)
        setPromptDraft(scene.systemPrompt || '')
        setPromptError(null)
        setError(null)
      }

      const closePrompt = () => {
        setPromptKey(null)
        setPromptDraft('')
        setPromptError(null)
      }

      const savePrompt = () => {
        if (promptKey === null) return
        const message = onSaveSystemPrompt(promptKey, promptDraft)
        if (message) {
          setPromptError(message)
          return
        }
        closePrompt()
      }

      const clearPrompt = () => {
        if (promptKey === null) return
        const message = onSaveSystemPrompt(promptKey, '')
        if (message) {
          setPromptError(message)
          return
        }
        closePrompt()
      }

      const cancelEdit = () => {
        setEditingKey(null)
        setDraftName('')
        setError(null)
      }

      const saveEdit = () => {
        if (editingKey === null) return
        const message = onRename(editingKey, draftName)
        if (message) {
          setError(message)
          return
        }
        cancelEdit()
      }

      const onKeyDown = (event) => {
        if (event.nativeEvent && event.nativeEvent.isComposing) return
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          if (promptKey !== null) {
            closePrompt()
            return
          }
          if (editingKey !== null) {
            cancelEdit()
            return
          }
          if (confirmKey !== null) {
            setConfirmKey(null)
            return
          }
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      const userScenes = scenes.filter((scene) => !scene.builtin)

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-scene-manager-title',
            'aria-describedby': 'dsh-pl-scene-manager-hint',
            onKeyDown,
          },
          h('h2', { id: 'dsh-pl-scene-manager-title', className: 'dsh-pl-dialog-title' }, t('dialog.scenes')),
          h('p', { id: 'dsh-pl-scene-manager-hint', className: 'dsh-pl-hint' }, t('scenes.managerHint')),
          h(
            'div',
            { className: 'dsh-pl-scene-manager' },
            scenes.map((scene) => {
              const editing = editingKey === scene.key
              const confirming = confirmKey === scene.key
              return h(
                'div',
                { className: 'dsh-pl-scene-row', key: scene.key },
                editing
                  ? h(
                      'div',
                      { className: 'dsh-pl-scene-edit' },
                      h('input', {
                        ref: renameRef,
                        type: 'text',
                        maxLength: 40,
                        value: draftName,
                        'aria-label': `${t('scenes.rename')}: ${scene.label}`,
                        onChange: (event) => {
                          setDraftName(event.target.value)
                          setError(null)
                        },
                        onKeyDown: (event) => {
                          if (event.nativeEvent && event.nativeEvent.isComposing) return
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            saveEdit()
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault()
                            event.stopPropagation()
                            cancelEdit()
                          }
                        },
                      }),
                      h(
                        'button',
                        { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-primary', onClick: saveEdit },
                        t('action.save'),
                      ),
                      h(
                        'button',
                        { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: cancelEdit },
                        t('action.cancel'),
                      ),
                    )
                  : h(
                      React.Fragment,
                      null,
                      h(
                        'div',
                        { className: 'dsh-pl-scene-row-main' },
                        h('span', { className: 'dsh-pl-scene-row-name' }, scene.label),
                        h(
                          'span',
                          { className: confirming ? 'dsh-pl-scene-confirm' : 'dsh-pl-scene-row-meta' },
                          confirming ? t('scenes.deleteConfirm') : t('scenes.count', { count: scene.count }),
                        ),
                      ),
                      scene.builtin
                        ? h(
                            'div',
                            { className: 'dsh-pl-scene-row-actions' },
                            h('span', { className: 'dsh-pl-badge' }, t('badge.builtin')),
                          )
                        : confirming
                          ? h(
                              'div',
                              { className: 'dsh-pl-scene-row-actions' },
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger',
                                  'aria-label': `${t('scenes.delete')}: ${scene.label}`,
                                  onClick: () => {
                                    onDelete(scene.key)
                                    setConfirmKey(null)
                                  },
                                },
                                t('scenes.delete'),
                              ),
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'dsh-pl-btn dsh-pl-btn-sm',
                                  onClick: () => setConfirmKey(null),
                                },
                                t('action.cancel'),
                              ),
                            )
                          : h(
                              'div',
                              { className: 'dsh-pl-scene-row-actions' },
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'dsh-pl-btn dsh-pl-btn-sm',
                                  'aria-label': `${t('scenes.systemPrompt')}: ${scene.label}`,
                                  onClick: () => openPrompt(scene),
                                },
                                t('scenes.systemPrompt'),
                              ),
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'dsh-pl-btn dsh-pl-btn-sm',
                                  'aria-label': `${t('scenes.rename')}: ${scene.label}`,
                                  onClick: () => startRename(scene),
                                },
                                t('scenes.rename'),
                              ),
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-danger',
                                  'aria-label': `${t('scenes.delete')}: ${scene.label}`,
                                  onClick: () => {
                                    setConfirmKey(scene.key)
                                    setEditingKey(null)
                                    setError(null)
                                  },
                                },
                                t('scenes.delete'),
                              ),
                            ),
                    ),
              )
            }),
          ),
          promptKey !== null
            ? (() => {
                const promptScene = scenes.find((scene) => scene.key === promptKey)
                const promptBuiltin = promptScene !== undefined && promptScene.builtin
                return h(
                  'div',
                  { className: 'dsh-pl-scene-prompt-editor' },
                  h(
                    'div',
                    { className: 'dsh-pl-scene-prompt-head' },
                    h('h3', null, t('scenes.systemPrompt')),
                    promptBuiltin ? h('span', { className: 'dsh-pl-badge' }, t('badge.builtin')) : null,
                  ),
                  h('p', { className: 'dsh-pl-hint' }, t('scenes.systemPromptHint')),
                  h('textarea', {
                    ref: promptRef,
                    maxLength: SCENE_PROMPT_MAX,
                    readOnly: promptBuiltin,
                    value: promptDraft,
                    placeholder: t('scenes.systemPromptPlaceholder'),
                    'aria-label': t('scenes.systemPrompt'),
                    onChange: (event) => {
                      setPromptDraft(event.target.value)
                      setPromptError(null)
                    },
                  }),
                  promptBuiltin ? h('p', { className: 'dsh-pl-hint' }, t('scenes.systemPromptReadOnly')) : null,
                  promptError ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, promptError) : null,
                  h(
                    'div',
                    { className: 'dsh-pl-dialog-actions' },
                    promptBuiltin
                      ? null
                      : h(
                          'button',
                          { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: clearPrompt },
                          t('scenes.systemPromptClear'),
                        ),
                    h(
                      'button',
                      { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-sm', onClick: closePrompt },
                      t('action.cancel'),
                    ),
                    promptBuiltin
                      ? null
                      : h(
                          'button',
                          {
                            type: 'button',
                            className: 'dsh-pl-btn dsh-pl-btn-sm dsh-pl-btn-primary',
                            onClick: savePrompt,
                          },
                          t('action.save'),
                        ),
                  ),
                )
              })()
            : null,
          userScenes.length === 0
            ? h('p', { className: 'dsh-pl-scene-manager-empty' }, t('scenes.emptyManager'))
            : null,
          error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, error) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', ref: closeRef, className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
            ),
          ),
        ),
      )
    }

    function ImportSceneDialog({ t, onImport, onClose }) {
      const dialogRef = React.useRef(null)
      const textRef = React.useRef(null)
      const [text, setText] = React.useState('')
      const [preview, setPreview] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [updateExisting, setUpdateExisting] = React.useState(false)
      const [success, setSuccess] = React.useState(false)
      const [copyStatus, setCopyStatus] = React.useState(null)

      React.useEffect(() => {
        const previous = document.activeElement
        const input = textRef.current
        if (input !== null && typeof input.focus === 'function') input.focus()
        return () => {
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      const errorText = (result) => {
        const key = `import.error.${result.code}`
        const textValue = t(key)
        return textValue === key ? t('import.error.schema') : textValue
      }

      const parse = () => {
        const result = parseGeneratedScene(text)
        if (!result.ok) {
          setPreview(null)
          setError(errorText(result))
          return
        }
        setPreview(result.scene)
        setError(null)
        setSuccess(false)
      }

      const confirm = () => {
        if (preview === null) return
        const result = onImport(preview, { update: updateExisting })
        if (!result.ok) {
          setSuccess(false)
          setError(errorText(result))
          return
        }
        setSuccess(true)
        setError(null)
      }

      const changeText = (value) => {
        setText(value)
        setPreview(null)
        setError(null)
        setSuccess(false)
        setCopyStatus(null)
      }

      const changeName = (value) => {
        setPreview((current) => (current === null ? current : { ...current, name: value }))
        setError(null)
        setSuccess(false)
      }

      const copyJson = async () => {
        if (preview === null) return
        const value = JSON.stringify({ version: 1, scene: preview }, null, 2)
        try {
          if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('clipboard-unavailable')
          }
          await navigator.clipboard.writeText(value)
          setCopyStatus(t('import.copied'))
        } catch (error) {
          console.error('prompt-library: could not copy generated JSON', error)
          setCopyStatus(t('import.copyFailed'))
        }
      }

      const onKeyDown = (event) => {
        if (event.nativeEvent && event.nativeEvent.isComposing) return
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        const dialog = dialogRef.current
        if (dialog === null) return
        const nodes = dialog.querySelectorAll('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      return h(
        'div',
        {
          className: 'dsh-pl-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref: dialogRef,
            className: 'dsh-pl-dialog dsh-pl-import-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': 'dsh-pl-import-title',
            onKeyDown,
          },
          h('h2', { id: 'dsh-pl-import-title', className: 'dsh-pl-dialog-title' }, t('import.title')),
          h('p', { className: 'dsh-pl-hint' }, t('import.hint')),
          h('div', { className: 'dsh-pl-field' },
            h('label', { htmlFor: 'dsh-pl-import-json' }, t('import.hint')),
            h('textarea', {
              id: 'dsh-pl-import-json',
              ref: textRef,
              className: 'dsh-pl-import-textarea',
              value: text,
              placeholder: t('import.placeholder'),
              onChange: (event) => changeText(event.target.value),
            }),
          ),
          error ? h('p', { className: 'dsh-pl-form-error', role: 'alert' }, error) : null,
          preview !== null
            ? h(
                'div',
                { className: 'dsh-pl-import-preview' },
                h('div', { className: 'dsh-pl-field' },
                  h('label', { htmlFor: 'dsh-pl-import-name' }, t('import.sceneName')),
                  h('input', {
                    id: 'dsh-pl-import-name',
                    type: 'text',
                    maxLength: GENERATED_SCENE_NAME_MAX,
                    value: preview.name,
                    onChange: (event) => changeName(event.target.value),
                  }),
                ),
                h('div', { className: 'dsh-pl-import-block' },
                  h('h3', null, t('import.systemPrompt')),
                  h('pre', { className: 'dsh-pl-import-system' }, preview.systemPrompt),
                ),
                h('div', { className: 'dsh-pl-import-block' },
                  h('h3', null, t('import.cards', { count: preview.templates.length })),
                  preview.templates.map((card, index) =>
                    h('div', { className: 'dsh-pl-import-card', key: `${index}:${card.title}` },
                      h('strong', null, card.title),
                      h('p', null, card.body),
                    ),
                  ),
                ),
                h('label', { className: 'dsh-pl-import-update' },
                  h('input', {
                    type: 'checkbox',
                    checked: updateExisting,
                    onChange: (event) => {
                      setUpdateExisting(event.target.checked)
                      setError(null)
                      setSuccess(false)
                    },
                  }),
                  h('span', null, t('import.update')),
                ),
              )
            : null,
          success ? h('p', { className: 'dsh-pl-import-success', role: 'status' }, t('import.success')) : null,
          copyStatus ? h('p', { className: 'dsh-pl-hint', role: 'status' }, copyStatus) : null,
          h(
            'div',
            { className: 'dsh-pl-dialog-foot' },
            h('span', { className: 'dsh-pl-hint' }, success ? t('import.success') : t('import.editName')),
            h(
              'div',
              { className: 'dsh-pl-dialog-actions' },
              h('button', { type: 'button', className: 'dsh-pl-btn', onClick: onClose }, t('action.cancel')),
              preview !== null
                ? h('button', { type: 'button', className: 'dsh-pl-btn', onClick: copyJson }, t('import.copy'))
                : null,
              preview === null
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-primary',
                      disabled: text.trim() === '',
                      onClick: parse,
                    },
                    t('import.parse'),
                  )
                : h(
                    'button',
                    { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: confirm },
                    t('import.confirm'),
                  ),
            ),
          ),
        ),
      )
    }

    function PromptLibraryPage({ t, useSessions, onUse, onBack, onScenePromptChange }) {
      const templates = React.useSyncExternalStore(subscribeTemplates, getTemplatesSnapshot)
      const categoryStore = React.useSyncExternalStore(subscribeCategories, getCategoriesSnapshot)
      React.useSyncExternalStore(subscribeScenePrompts, getScenePromptsSnapshot)
      const activeSessionId = useSessions((state) => {
        const byId = state && state.byId
        if (!byId) return undefined
        let fallback
        let count = 0
        for (const key of Object.keys(byId)) {
          const row = byId[key]
          if (!row) continue
          const id = row.id || row.sessionId || key
          if (fallback === undefined) fallback = id
          count += 1
          const retained = row.retainedBy ? row.retainedBy.mainView : 0
          if ((retained || 0) > 0) return id
        }
        for (const key of Object.keys(byId)) {
          const row = byId[key]
          if (!row || !row.retainedBy) continue
          if (Object.values(row.retainedBy).some((value) => (value || 0) > 0)) {
            return row.id || row.sessionId || key
          }
        }
        return count === 1 ? fallback : undefined
      })

      const [query, setQuery] = React.useState('')
      const [category, setCategory] = React.useState('all')
      const [editor, setEditor] = React.useState(null)
      const [confirmId, setConfirmId] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [categoryEditor, setCategoryEditor] = React.useState(null)
      const [sceneManagerOpen, setSceneManagerOpen] = React.useState(false)
      const [importSceneOpen, setImportSceneOpen] = React.useState(false)

      React.useEffect(() => {
        if (notice === null) return undefined
        const timer = window.setTimeout(() => setNotice(null), 3200)
        return () => window.clearTimeout(timer)
      }, [notice])

      React.useEffect(() => {
        if (confirmId === null) return undefined
        const timer = window.setTimeout(() => setConfirmId(null), 4500)
        return () => window.clearTimeout(timer)
      }, [confirmId])

      const allItems = buildItems(t)
      const generatorItem = allItems.find((item) => item.generator)
      const items = allItems.filter((item) => !item.generator)
      const categories = categoriesOf(items, categoryStore, t)
      const activeCategory =
        category === 'all' || categories.some((entry) => entry.key === category) ? category : 'all'
      const visible = filterItems(items, query, activeCategory)
      const builtinItems = visible.filter((item) => item.builtin)
      const mineItems = visible.filter((item) => !item.builtin)
      const noFilter = query.trim() === '' && activeCategory === 'all'
      const activeCategoryLabel = categories.find((entry) => entry.key === activeCategory)?.label ?? ''
      const categoryEmpty = visible.length === 0 && query.trim() === '' && activeCategory !== 'all'
      const sceneRows = categories
        .filter((entry) => entry.key !== 'user:')
        .map((entry) => ({
          key: entry.key,
          label: entry.label,
          builtin: entry.key.startsWith('builtin:'),
          systemPrompt: scenePromptFor(entry.key, t),
          count: items.filter((item) => item.categoryKey === entry.key).length,
        }))

      const openCreate = (initial) => {
        setEditor({
          mode: 'create',
          title: initial && initial.title ? initial.title : '',
          body: initial && initial.body ? initial.body : '',
          category: initial && initial.category ? initial.category : '',
          error: null,
        })
      }

      const openEdit = (item) => {
        setEditor({
          mode: 'edit',
          id: item.id,
          title: item.title,
          body: item.body,
          category: item.rawCategory || '',
          error: null,
        })
      }

      const openCategory = () => {
        setCategoryEditor({ name: '', error: null })
      }

      const changeCategoryEditor = (patch) => {
        setCategoryEditor((current) => (current === null ? current : { ...current, ...patch, error: null }))
      }

      const saveCategory = () => {
        if (categoryEditor === null) return
        const name = categoryEditor.name.trim()
        if (name === '') {
          setCategoryEditor({ ...categoryEditor, error: t('form.categoryRequired') })
          return
        }
        const existing = categories.find((entry) => entry.label.toLowerCase() === name.toLowerCase())
        if (existing !== undefined) {
          setCategory(existing.key)
          setCategoryEditor(null)
          setNotice({ text: t('notice.categoryExists'), tone: 'ok', key: Date.now() })
          return
        }
        const key = ensureUserCategory(name, t)
        if (key !== null) setCategory(key)
        setCategoryEditor(null)
        setNotice({ text: t('notice.categoryAdded'), tone: 'ok', key: Date.now() })
      }

      const syncActiveScenePrompt = (sceneKey, prompt) => {
        if (activeSessionId === undefined || typeof onScenePromptChange !== 'function') return
        if (getSceneSelection(activeSessionId) !== sceneKey) return
        const payload = {
          v: 1,
          active: prompt.trim() !== '',
          sceneKey,
          prompt,
        }
        Promise.resolve(onScenePromptChange(activeSessionId, payload)).then(
          (result) => {
            if (result !== undefined && result.ok === false) {
              setNotice({ text: t('scenes.systemPromptFailed'), tone: 'error', key: Date.now() })
            }
          },
          (error) => {
            console.error('prompt-library: could not update the scene system prompt', error)
            setNotice({ text: t('scenes.systemPromptFailed'), tone: 'error', key: Date.now() })
          },
        )
      }

      const clearActiveScenePrompt = (sceneKey) => {
        if (activeSessionId === undefined || typeof onScenePromptChange !== 'function') return
        Promise.resolve(
          onScenePromptChange(activeSessionId, {
            v: 1,
            active: false,
            sceneKey,
            prompt: '',
          }),
        ).then(
          (result) => {
            if (result !== undefined && result.ok === false) {
              setNotice({ text: t('scenes.systemPromptFailed'), tone: 'error', key: Date.now() })
            }
          },
          (error) => {
            console.error('prompt-library: could not clear the scene system prompt', error)
            setNotice({ text: t('scenes.systemPromptFailed'), tone: 'error', key: Date.now() })
          },
        )
      }

      const saveScenePrompt = (sceneKey, text) => {
        if (!sceneKey.startsWith('user:')) return t('scenes.systemPromptReadOnly')
        const result = setUserScenePrompt(sceneKey, text)
        if (result.ok === false) {
          return t(
            result.code === 'too-long' ? 'scenes.systemPromptTooLong' : 'scenes.systemPromptSaveFailed',
            result.code === 'too-long' ? { max: SCENE_PROMPT_MAX } : undefined,
          )
        }
        setNotice({ text: t('scenes.systemPromptSaved'), tone: 'ok', key: Date.now() })
        syncActiveScenePrompt(sceneKey, scenePromptFor(sceneKey, t))
        return null
      }

      const openSceneManager = () => {
        setSceneManagerOpen(true)
      }

      const useGenerator = (item) => {
        if (activeSessionId === undefined || typeof onScenePromptChange !== 'function') {
          setNotice({ text: t('scenes.generatorNeedsSession'), tone: 'error', key: Date.now() })
          return
        }
        if (item === undefined || typeof item.systemPrompt !== 'string' || item.systemPrompt === '') {
          setNotice({ text: t('scenes.generatorFailed'), tone: 'error', key: Date.now() })
          return
        }
        Promise.resolve(
          onScenePromptChange(activeSessionId, {
            v: 1,
            active: true,
            sceneKey: item.id,
            prompt: item.systemPrompt,
          }),
        ).then(
          (result) => {
            if (result !== undefined && result.ok === false) {
              setNotice({ text: t('scenes.generatorFailed'), tone: 'error', key: Date.now() })
              return
            }
            onUse(item.body, true)
          },
          (error) => {
            console.error('prompt-library: could not start the generator', error)
            setNotice({ text: t('scenes.generatorFailed'), tone: 'error', key: Date.now() })
          },
        )
      }

      const importScene = (scene, options) => {
        const result = importGeneratedScene(scene, t, options)
        if (result.ok) {
          setCategory(result.sceneKey)
          setNotice({ text: t(result.updated ? 'import.updated' : 'import.success'), tone: 'ok', key: Date.now() })
        }
        return result
      }

      const renameUserScene = (key, name) => {
        if (!key.startsWith('user:')) return t('form.sceneExists')
        const oldName = key.slice('user:'.length)
        const nextName = name.trim()
        if (oldName === '' || nextName === '') return t('form.categoryRequired')
        const duplicate = categories.find(
          (entry) => entry.key !== key && entry.label.toLowerCase() === nextName.toLowerCase(),
        )
        if (duplicate !== undefined) return t('form.sceneExists')
        const oldKey = templateCategoryKey(oldName)
        const nextSceneKey = `user:${nextName}`
        const wasActive = activeSessionId !== undefined && getSceneSelection(activeSessionId) === key
        setUserCategories(
          userCategories.map((entry) => (templateCategoryKey(entry) === oldKey ? nextName : entry)),
        )
        setUserTemplates(
          userTemplates.map((template) =>
            templateCategoryKey(template.category) === oldKey ? { ...template, category: nextName } : template,
          ),
        )
        moveUserScenePrompt(key, nextSceneKey)
        renameSceneSelection(key, nextSceneKey)
        if (category === key) setCategory(nextSceneKey)
        if (wasActive) syncActiveScenePrompt(nextSceneKey, scenePromptFor(nextSceneKey, t))
        setNotice({ text: t('notice.sceneRenamed'), tone: 'ok', key: Date.now() })
        return null
      }

      const deleteUserScene = (key) => {
        if (!key.startsWith('user:')) return
        const oldName = key.slice('user:'.length)
        if (oldName === '') return
        const oldKey = templateCategoryKey(oldName)
        const wasActive = activeSessionId !== undefined && getSceneSelection(activeSessionId) === key
        setUserCategories(userCategories.filter((entry) => templateCategoryKey(entry) !== oldKey))
        setUserTemplates(
          userTemplates.map((template) =>
            templateCategoryKey(template.category) === oldKey ? { ...template, category: '' } : template,
          ),
        )
        removeUserScenePrompt(key)
        removeSceneSelectionByKey(key)
        if (category === key) setCategory('all')
        if (wasActive) clearActiveScenePrompt(key)
        setNotice({ text: t('notice.sceneDeleted'), tone: 'ok', key: Date.now() })
      }

      const changeEditor = (patch) => {
        setEditor((current) => (current === null ? current : { ...current, ...patch, error: null }))
      }

      const saveEditor = () => {
        if (editor === null) return
        const title = editor.title.trim()
        const body = editor.body.trim()
        if (title === '' || body === '') {
          setEditor({ ...editor, error: t('form.required') })
          return
        }
        let nextCategory = editor.category.trim()
        if (nextCategory !== '') {
          const categoryKey = ensureUserCategory(nextCategory, t)
          if (categoryKey !== null && categoryKey.startsWith('user:') && categoryKey !== 'user:') {
            nextCategory = categoryKey.slice('user:'.length)
          }
        }
        if (editor.mode === 'edit' && editor.id) {
          updateTemplate(editor.id, { title, body, category: nextCategory })
        } else {
          createTemplate({ title, body, category: nextCategory })
        }
        setEditor(null)
        setConfirmId(null)
      }

      const copyItem = async (item) => {
        try {
          if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('clipboard-unavailable')
          }
          await navigator.clipboard.writeText(item.body)
          setNotice({ text: t('notice.copied'), tone: 'ok', key: Date.now() })
        } catch (error) {
          console.error('prompt-library: copy failed', error)
          setNotice({ text: t('notice.copyFailed'), tone: 'error', key: Date.now() })
        }
      }

      const insertItem = (item) => {
        onUse(item.body, activeSessionId !== undefined)
      }

      const duplicateItem = (item) => {
        openCreate({
          title: t('duplicate.title', { title: item.title }),
          body: item.body,
          category: item.builtin ? item.categoryLabel : item.rawCategory,
        })
      }

      const renderSection = (title, hint, list, emptyState) => {
        if (list.length === 0 && emptyState === null) return null
        return h(
          'section',
          { className: 'dsh-pl-section', key: title },
          h(
            'div',
            { className: 'dsh-pl-section-head' },
            h('h2', null, title),
            h('span', { className: 'dsh-pl-section-count' }, String(list.length)),
            hint ? h('span', { className: 'dsh-pl-section-hint' }, hint) : null,
          ),
          list.length === 0
            ? emptyState
            : h(
                'div',
                { className: 'dsh-pl-grid' },
                list.map((item) =>
                  h(TemplateCard, {
                    key: item.id,
                    item,
                    t,
                    confirming: confirmId === item.id,
                    onInsert: () => insertItem(item),
                    onCopy: () => copyItem(item),
                    onDuplicate: () => duplicateItem(item),
                    onEdit: () => openEdit(item),
                    onAskDelete: () => setConfirmId(item.id),
                    onCancelDelete: () => setConfirmId(null),
                    onDelete: () => {
                      deleteTemplate(item.id)
                      setConfirmId(null)
                    },
                  }),
                ),
              ),
        )
      }

      const mineEmpty = h(
        'div',
        { className: 'dsh-pl-empty' },
        h('p', { className: 'dsh-pl-empty-title' }, t('empty.mine')),
        h(
          'button',
          { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary dsh-pl-empty-action', onClick: () => openCreate() },
          h(PlusIcon, { size: 14 }),
          t('action.create'),
        ),
      )

      const generatorPanel =
        generatorItem === undefined
          ? null
          : h(
              'section',
              { className: 'dsh-pl-generator', 'aria-label': t('generator.title') },
              h(
                'div',
                { className: 'dsh-pl-generator-main' },
                h('span', { className: 'dsh-pl-generator-icon', 'aria-hidden': 'true' }, h(TemplateIcon, { size: 16 })),
                h(
                  'div',
                  { className: 'dsh-pl-generator-copy' },
                  h('h2', { className: 'dsh-pl-generator-title' }, t('generator.title')),
                  h('p', { className: 'dsh-pl-generator-hint' }, t('generator.hint')),
                ),
              ),
              h(
                'div',
                { className: 'dsh-pl-generator-actions' },
                h(
                  'button',
                  { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: () => useGenerator(generatorItem) },
                  t('action.useGenerator'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-pl-btn dsh-pl-btn-outline',
                    'aria-haspopup': 'dialog',
                    onClick: () => setImportSceneOpen(true),
                  },
                  t('action.importScene'),
                ),
              ),
            )

      return h(
        'section',
        { className: 'dsh-pl-page', 'aria-label': t('page.title') },
        h('style', { key: 'style' }, PAGE_CSS),
        h(
          'div',
          { className: 'dsh-pl-scroll' },
          h(
            'div',
            { className: 'dsh-pl-content' },
            h(
              'header',
              { className: 'dsh-pl-heading' },
              h(
                'div',
                { className: 'dsh-pl-heading-text' },
                h('h1', null, t('page.title')),
                h('p', { className: 'dsh-pl-subtitle' }, t('page.subtitle')),
              ),
              h(
                'div',
                { className: 'dsh-pl-heading-actions' },
                h(
                  'button',
                  { type: 'button', className: 'dsh-pl-btn dsh-pl-btn-primary', onClick: () => openCreate() },
                  h(PlusIcon, { size: 14 }),
                  t('action.create'),
                ),
                h(
                  'button',
                  { type: 'button', className: 'dsh-pl-icon-btn', 'aria-label': t('action.back'), title: t('action.back'), onClick: onBack },
                  h(ArrowLeftIcon, { size: 16 }),
                ),
              ),
            ),
            notice
              ? h(
                  'div',
                  { className: 'dsh-pl-notice', role: 'status', 'data-tone': notice.tone, key: notice.key },
                  notice.text,
                )
              : null,
            generatorPanel,
            h(
              'div',
              { className: 'dsh-pl-toolbar' },
              h(
                'div',
                { className: 'dsh-pl-toolbar-main' },
                h(
                  'div',
                  { className: 'dsh-pl-search' },
                  h(SearchIcon, { size: 14 }),
                  h('input', {
                    type: 'search',
                    value: query,
                    placeholder: t('search.placeholder'),
                    'aria-label': t('search.placeholder'),
                    onChange: (event) => {
                      setQuery(event.target.value)
                      setConfirmId(null)
                    },
                  }),
                  query !== ''
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'dsh-pl-search-clear',
                          'aria-label': t('search.clear'),
                          title: t('search.clear'),
                          onClick: () => setQuery(''),
                        },
                        h(CloseIcon, { size: 12 }),
                      )
                    : null,
                ),
                h(
                  'div',
                  { className: 'dsh-pl-toolbar-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-sm',
                      'aria-haspopup': 'dialog',
                      'aria-label': t('category.add'),
                      title: t('category.add'),
                      onClick: openCategory,
                    },
                    h(PlusIcon, { size: 12 }),
                    t('category.add'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-sm',
                      'aria-haspopup': 'dialog',
                      'aria-label': t('action.manageScenes'),
                      title: t('action.manageScenes'),
                      onClick: openSceneManager,
                    },
                    t('action.manageScenes'),
                  ),
                ),
                h('div', { className: 'dsh-pl-count' }, t('count', { count: visible.length })),
              ),
              h(
                'div',
                { className: 'dsh-pl-chips', role: 'group' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-pl-chip',
                    'data-active': activeCategory === 'all' ? 'true' : 'false',
                    'aria-pressed': activeCategory === 'all',
                    onClick: () => setCategory('all'),
                  },
                  t('filter.all'),
                ),
                categories.map((entry) =>
                  h(
                    'button',
                    {
                      key: entry.key,
                      type: 'button',
                      className: 'dsh-pl-chip',
                      'data-active': activeCategory === entry.key ? 'true' : 'false',
                      'aria-pressed': activeCategory === entry.key,
                      onClick: () => setCategory(entry.key),
                    },
                    entry.label,
                  ),
                ),
              ),
            ),
            visible.length === 0
              ? h(
                  'div',
                  { className: 'dsh-pl-empty' },
                  h('p', { className: 'dsh-pl-empty-title' }, t(categoryEmpty ? 'empty.category' : 'empty.search')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-pl-btn dsh-pl-btn-primary dsh-pl-empty-action',
                      onClick: () => openCreate(categoryEmpty ? { category: activeCategoryLabel } : undefined),
                    },
                    h(PlusIcon, { size: 14 }),
                    t(categoryEmpty ? 'action.createInCategory' : 'action.create'),
                  ),
                )
              : h(
                  React.Fragment,
                  null,
                  renderSection(t('section.mine'), t('section.mineHint'), mineItems, noFilter ? mineEmpty : null),
                  renderSection(t('section.builtin'), null, builtinItems, null),
                ),
          ),
        ),
        editor
          ? h(EditorDialog, {
              t,
              editor,
              categories: [...new Set(items.map((item) => item.categoryLabel))].sort((left, right) => left.localeCompare(right)),
              onChange: changeEditor,
              onSave: saveEditor,
              onClose: () => setEditor(null),
            })
          : null,
        categoryEditor
          ? h(CategoryDialog, {
              t,
              editor: categoryEditor,
              onChange: changeCategoryEditor,
              onSave: saveCategory,
              onClose: () => setCategoryEditor(null),
            })
          : null,
        sceneManagerOpen
          ? h(SceneManagerDialog, {
              t,
              scenes: sceneRows,
              onRename: renameUserScene,
              onDelete: deleteUserScene,
              onSaveSystemPrompt: saveScenePrompt,
              onClose: () => setSceneManagerOpen(false),
            })
          : null,
        importSceneOpen
          ? h(ImportSceneDialog, {
              t,
              onImport: importScene,
              onClose: () => setImportSceneOpen(false),
            })
          : null,
      )
    }

    function ComposerTrigger({ t }) {
      const open = React.useSyncExternalStore(subscribePicker, getPickerSnapshot)
      return h(
        'button',
        {
          type: 'button',
          className: 'dsh-pl-trigger-btn',
          'data-dsh-pl-trigger': '',
          'aria-label': t('composer.trigger'),
          title: t('composer.trigger'),
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          onClick: togglePicker,
        },
        h(TemplateIcon, { size: 16 }),
      )
    }

    function ScenePromptDock({ t, sessionId, inputActions, useSession, onScenePromptChange }) {
      const blank = useSession((snapshot) => snapshot !== undefined && snapshot.blank === true)
      React.useSyncExternalStore(subscribeTemplates, getTemplatesSnapshot)
      const categoryStore = React.useSyncExternalStore(subscribeCategories, getCategoriesSnapshot)
      React.useSyncExternalStore(subscribeScenePrompts, getScenePromptsSnapshot)
      const [activeKey, setActiveKey] = React.useState(() => getSceneSelection(sessionId) || '')
      const [notice, setNotice] = React.useState(null)
      const [showPeek, setShowPeek] = React.useState(false)
      const applyChainRef = React.useRef(Promise.resolve())
      const sceneGridRef = React.useRef(null)

      const applyScene = (sceneKey, prompt) => {
        const hasPrompt = typeof prompt === 'string' && prompt.trim() !== ''
        if (typeof onScenePromptChange !== 'function') {
          if (hasPrompt) console.error('prompt-library: scene system prompt control is unavailable')
          return Promise.resolve(!hasPrompt)
        }
        const payload = {
          v: 1,
          active: hasPrompt,
          sceneKey: typeof sceneKey === 'string' ? sceneKey : 'all',
          prompt: hasPrompt ? prompt : '',
        }
        const task = applyChainRef.current.then(() => onScenePromptChange(sessionId, payload))
        applyChainRef.current = task.then(
          () => undefined,
          () => undefined,
        )
        return task.then(
          (result) => {
            if (result !== undefined && result.ok === false) {
              console.error('prompt-library: could not apply the scene system prompt', result)
              return false
            }
            return true
          },
          (error) => {
            console.error('prompt-library: could not apply the scene system prompt', error)
            return false
          },
        )
      }

      const items = buildItems(t)
      const counts = new Map()
      for (const item of items) counts.set(item.categoryKey, (counts.get(item.categoryKey) || 0) + 1)
      const categories = categoriesOf(items, categoryStore, t).filter(
        (entry) => entry.key !== 'user:' && entry.key !== 'builtin:meta' && (counts.get(entry.key) || 0) > 0,
      )
      const scenes = items.length === 0 ? [] : categories
      const active = scenes.find((entry) => entry.key === activeKey)
      const cards = active === undefined ? [] : sceneCardsFor(items, active.key)

      React.useEffect(() => {
        const node = sceneGridRef.current
        if (node === null) {
          setShowPeek(false)
          return undefined
        }
        const updatePeek = () => {
          setShowPeek(cards.length > 5 && node.scrollLeft + node.clientWidth < node.scrollWidth - 2)
        }
        updatePeek()
        node.addEventListener('scroll', updatePeek, { passive: true })
        return () => node.removeEventListener('scroll', updatePeek)
      }, [cards.length, activeKey])

      React.useEffect(() => {
        if (!blank) return undefined
        const selected = getSceneSelection(sessionId)
        if (selected === '') return undefined
        const valid = scenes.some((entry) => entry.key === selected)
        if (!valid) {
          setActiveKey('')
          setSceneSelection(sessionId, '')
          void applyScene('none', '')
          return undefined
        }
        setActiveKey(selected)
        return undefined
        // The mount-time restore is intentionally scoped to the Session, not to every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [blank, sessionId])

      const insertCard = (item) => {
        if (!inputActions) {
          setNotice({ tone: 'error', text: t('scenes.insertFailed') })
          return
        }
        try {
          const span = inputActions.captureInsertion()
          if (inputActions.insertText(item.body, span)) {
            setNotice({ tone: 'ok', text: t('scenes.inserted', { title: item.title }) })
          } else {
            setNotice({ tone: 'error', text: t('scenes.insertFailed') })
          }
        } catch (error) {
          console.error('prompt-library: could not insert a scene card', error)
          setNotice({ tone: 'error', text: t('scenes.insertFailed') })
        }
      }

      const choose = async (item) => {
        const nextKey = item.categoryKey
        const hostKey = item.systemPrompt ? item.id : nextKey
        const prompt = item.systemPrompt || scenePromptFor(nextKey)
        await applyScene(hostKey, prompt)
        insertCard(item)
      }

      const selectScene = (entry) => {
        setNotice(null)
        if (active !== undefined && active.key === entry.key) {
          setActiveKey('')
          setSceneSelection(sessionId, '')
          void applyScene('none', '')
          return
        }
        setActiveKey(entry.key)
        setSceneSelection(sessionId, entry.key)
        if (entry.key.startsWith('builtin:')) {
          void applyScene('none', '')
        } else {
          void applyScene(entry.key, scenePromptFor(entry.key))
        }
      }

      const iconFor = (item) => {
        const icons = {
          'builtin:workplace': '▤',
          'builtin:media': '✎',
          'builtin:polish': '✦',
          'builtin:study': '◎',
          'builtin:ppt': '▣',
          'builtin:code': '⌘',
          'builtin:job': '◈',
          'builtin:analysis': '◇',
          'builtin:life': '☼',
          'builtin:legal': '⚖',
        }
        return icons[item.categoryKey] || '▤'
      }

      const sceneTabs =
        scenes.length > 0
          ? h(
              'div',
              { className: 'dsh-pl-scenes-tabs', role: 'group', 'aria-label': t('scenes.label') },
              scenes.map((entry) =>
                h(
                  'button',
                  {
                    key: entry.key,
                    type: 'button',
                    className: 'dsh-pl-scene-tab',
                    'data-active': active !== undefined && entry.key === active.key ? 'true' : 'false',
                    'aria-pressed': active !== undefined && entry.key === active.key,
                    onClick: () => selectScene(entry),
                  },
                  entry.label,
                ),
              ),
            )
          : null

      const content =
        items.length === 0
          ? h(
              'div',
              { className: 'dsh-pl-scenes-empty' },
              h('p', null, t('scenes.empty')),
            )
          : h(
              React.Fragment,
              null,
              sceneTabs,
              active === undefined
                ? null
                : h(
                    'div',
                    { className: 'dsh-pl-scene-carousel' },
                    h(
                      'div',
                      {
                        ref: sceneGridRef,
                        className: 'dsh-pl-scene-grid',
                        'data-overflow': cards.length > 5 ? 'true' : 'false',
                      },
                      cards.map((item) =>
                      h(
                        'button',
                        {
                          key: item.id,
                          type: 'button',
                          className: 'dsh-pl-scene-card',
                          onClick: () => {
                            void choose(item)
                          },
                          'aria-label': `${item.title}. ${t('scenes.insert')}`,
                          title: item.title,
                        },
                        h(
                          'span',
                          { className: 'dsh-pl-scene-head' },
                          h('span', { className: 'dsh-pl-scene-icon', 'aria-hidden': 'true' }, iconFor(item)),
                          h('span', { className: 'dsh-pl-scene-title' }, item.title),
                        ),
                        h(
                          'span',
                          { className: 'dsh-pl-scene-desc' },
                          item.description || item.body.replace(/\s+/g, ' ').trim(),
                        ),
                      ),
                    ),
                    ),
                    cards.length > 5 && showPeek
                      ? h('span', { className: 'dsh-pl-scene-peek', 'aria-hidden': 'true' })
                      : null,
                  ),
              notice
                ? h('p', { className: 'dsh-pl-scenes-notice', 'data-tone': notice.tone, role: 'status' }, notice.text)
                : null,
            )

      if (!blank) return null

      return h(
        React.Fragment,
        null,
        h('style', { key: 'style' }, SCENE_CSS),
        h(
          'section',
          { className: 'dsh-pl-scenes', 'aria-label': t('scenes.label') },
          content,
        ),
      )
    }

    function PromptPickerOverlay({ t, inputActions, onManage, useSession }) {
      const templates = React.useSyncExternalStore(subscribeTemplates, getTemplatesSnapshot)
      const open = React.useSyncExternalStore(subscribePicker, getPickerSnapshot)
      const blank = useSession((snapshot) => snapshot !== undefined && snapshot.blank === true)
      const [query, setQuery] = React.useState('')
      const [active, setActive] = React.useState(0)
      const [error, setError] = React.useState('')
      const [flash, setFlash] = React.useState(null)
      const searchRef = React.useRef(null)
      const popRef = React.useRef(null)
      const listRef = React.useRef(null)

      const items = buildItems(t).filter((item) => !item.generator)
      const visible = filterItems(items, query, 'all')
      const activeIndex = visible.length === 0 ? -1 : Math.min(active, visible.length - 1)

      React.useEffect(() => {
        if (!open) return undefined
        setQuery('')
        setActive(0)
        setError('')
        const frame = window.requestAnimationFrame(() => {
          const input = searchRef.current
          if (input !== null && typeof input.focus === 'function') input.focus()
        })
        return () => window.cancelAnimationFrame(frame)
      }, [open])

      React.useEffect(() => {
        if (!open) return
        const node = listRef.current
        if (node === null) return
        const selected = node.querySelector('[data-active="true"]')
        if (selected !== null && typeof selected.scrollIntoView === 'function') {
          selected.scrollIntoView({ block: 'nearest' })
        }
      }, [activeIndex, blank, open, query])

      React.useEffect(() => {
        if (!open) return undefined
        const onPointerDown = (event) => {
          const target = event.target
          if (!(target instanceof Node)) return
          if (popRef.current !== null && popRef.current.contains(target)) return
          const element = target instanceof Element ? target : target.parentElement
          if (element !== null && element.closest('[data-dsh-pl-trigger]') !== null) return
          setPickerOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        return () => document.removeEventListener('pointerdown', onPointerDown, true)
      }, [open])

      React.useEffect(() => {
        let retry = null
        const attempt = () => {
          if (!inputActions) return
          const pending = pendingInsertion
          if (pending === null) return
          if (Date.now() - pending.at > PENDING_TTL) {
            clearInsertion(pending.nonce)
            return
          }
          let inserted = false
          try {
            const span = inputActions.captureInsertion()
            inserted = inputActions.insertText(pending.text, span)
          } catch (error) {
            console.error('prompt-library: could not insert a pending template', error)
            clearInsertion(pending.nonce)
            setFlash({ text: t('notice.insertFailed'), tone: 'error', key: Date.now() })
            return
          }
          if (inserted) {
            clearInsertion(pending.nonce)
            setFlash({ text: t('notice.inserted'), tone: 'ok', key: Date.now() })
            return
          }
          if (!pending.retried) {
            pending.retried = true
            retry = window.setTimeout(attempt, 250)
            return
          }
          clearInsertion(pending.nonce)
          setFlash({ text: t('notice.insertFailed'), tone: 'error', key: Date.now() })
        }
        attempt()
        const unsubscribe = subscribeInsertion(attempt)
        return () => {
          unsubscribe()
          if (retry !== null) window.clearTimeout(retry)
        }
      }, [inputActions, t])

      React.useEffect(() => {
        if (flash === null) return undefined
        const timer = window.setTimeout(() => setFlash(null), 2600)
        return () => window.clearTimeout(timer)
      }, [flash])

      const close = () => {
        setPickerOpen(false)
        setQuery('')
        setError('')
      }

      const insert = (item) => {
        if (!inputActions) return
        let inserted = false
        try {
          const span = inputActions.captureInsertion()
          inserted = inputActions.insertText(item.body, span)
        } catch (error) {
          console.error('prompt-library: could not insert the template', error)
          setError(t('notice.insertFailed'))
          return
        }
        if (inserted) {
          close()
          setFlash({ text: t('notice.inserted'), tone: 'ok', key: Date.now() })
        } else {
          setError(t('notice.insertFailed'))
        }
      }

      const onSearchChange = (event) => {
        setQuery(event.target.value)
        setActive(0)
        setError('')
      }

      const onSearchKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
          return
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          if (visible.length === 0) return
          setActive((current) => (current + 1) % visible.length)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          if (visible.length === 0) return
          setActive((current) => (current - 1 + visible.length) % visible.length)
          return
        }
        if (event.key === 'Enter') {
          event.preventDefault()
          if (activeIndex >= 0) insert(visible[activeIndex])
        }
      }

      const onPanelKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
          return
        }
        if (!blank || event.key !== 'Tab') return
        const panel = popRef.current
        if (panel === null) return
        const nodes = panel.querySelectorAll('button, input')
        const focusable = [...nodes].filter((node) => !node.disabled && node.offsetParent !== null)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      const content = h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'dsh-pl-pop-head' },
          h('div', { className: 'dsh-pl-pop-title' }, t('composer.title')),
          h(
            'div',
            { className: 'dsh-pl-pop-search' },
            h(SearchIcon, { size: 14 }),
            h('input', {
              ref: searchRef,
              type: 'search',
              value: query,
              placeholder: t('composer.search'),
              'aria-label': t('composer.search'),
              onChange: onSearchChange,
              onKeyDown: onSearchKeyDown,
            }),
          ),
        ),
        flash ? h('div', { className: 'dsh-pl-pop-flash', 'data-tone': flash.tone, role: 'status' }, flash.text) : null,
        h(
          'div',
          { ref: listRef, className: 'dsh-pl-pop-list' },
          visible.length === 0
            ? h('div', { className: 'dsh-pl-pop-empty' }, t('composer.empty'))
            : visible.map((item, index) =>
                h(
                  'button',
                  {
                    key: item.id,
                    type: 'button',
                    className: 'dsh-pl-pop-item',
                    'data-active': index === activeIndex ? 'true' : 'false',
                    onMouseEnter: () => setActive(index),
                    onClick: () => insert(item),
                  },
                  h('span', { className: 'dsh-pl-pop-item-title' }, item.title),
                  h(
                    'span',
                    { className: 'dsh-pl-pop-item-meta' },
                    `${item.categoryLabel} · ${t(item.builtin ? 'badge.builtin' : 'badge.mine')}`,
                  ),
                ),
              ),
        ),
        error ? h('div', { className: 'dsh-pl-pop-error', role: 'alert' }, error) : null,
        h(
          'div',
          { className: 'dsh-pl-pop-foot' },
          h('span', null, t('count', { count: visible.length })),
          h('button', { type: 'button', className: 'dsh-pl-pop-manage', onClick: onManage }, t('action.manage')),
        ),
      )

      const panel = h(
        'div',
        {
          ref: popRef,
          className: blank ? 'dsh-pl-pop dsh-pl-pop-modal' : 'dsh-pl-pop',
          role: 'dialog',
          'aria-modal': blank ? 'true' : undefined,
          'aria-label': t('composer.title'),
          onKeyDown: onPanelKeyDown,
        },
        content,
      )

      const body = open
        ? blank
          ? h(
              'div',
              {
                className: 'dsh-pl-pop-backdrop',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) close()
                },
              },
              panel,
            )
          : panel
        : null

      return h(
        React.Fragment,
        null,
        h('style', { key: 'style' }, PICKER_CSS),
        body,
        !open && flash !== null
          ? h(
              'div',
              {
                key: flash.key,
                className: blank ? 'dsh-pl-flash dsh-pl-flash-fixed' : 'dsh-pl-flash',
                'data-tone': flash.tone,
                role: 'status',
              },
              flash.text,
            )
          : null,
      )
    }

    // #endregion

    // #region Plugin --------------------------------------------------------------

    function apply(ctx) {
      const t = ctx.locale.bind(NS)
      let remoteCommands = null
      const sceneQueues = new Map()

      const encodeScenePayload = (payload) => {
        const bytes = new TextEncoder().encode(JSON.stringify(payload))
        let binary = ''
        for (const byte of bytes) binary += String.fromCharCode(byte)
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
      }

      const applyScenePrompt = (sessionId, payload) => {
        if (typeof sessionId !== 'string' || sessionId === '') {
          return Promise.resolve({ ok: false, code: 'unavailable' })
        }
        if (remoteCommands === null) {
          return Promise.resolve({ ok: false, code: 'unavailable' })
        }
        const line = `/prompt-library-scene ${encodeScenePayload(payload)}`
        const run = () => remoteCommands.execute(sessionId, line, [])
        const previous = sceneQueues.get(sessionId) || Promise.resolve()
        const task = previous.then(run, run)
        sceneQueues.set(
          sessionId,
          task.then(
            () => undefined,
            () => undefined,
          ),
        )
        return task.then(
          (result) => {
            if (result === undefined || result === null) return { ok: false, code: 'unknown' }
            if (result.ok === false) {
              return {
                ok: false,
                code: result.error && result.error.code ? result.error.code : 'failed',
                text: result.error && result.error.message ? result.error.message : '',
              }
            }
            const execution = result.value
            if (execution === undefined) return { ok: false, code: 'unknown' }
            if (execution.result === undefined || execution.result.kind !== 'success') {
              return {
                ok: false,
                code: 'error',
                text: execution.result && execution.result.text ? execution.result.text : '',
              }
            }
            return { ok: true }
          },
          (error) => {
            console.error('prompt-library: could not execute the scene system prompt command', error)
            return { ok: false, code: 'failed' }
          },
        )
      }

      if (typeof ctx.inject === 'function') {
        try {
          ctx.inject(['remote', 'remote.commands'], (remoteCtx) => {
            const remote = remoteCtx.remote
            if (remote === undefined || remote.commands === undefined) return () => {}
            remoteCommands = remote.commands
            return () => {
              remoteCommands = null
            }
          })
        } catch (error) {
          console.error('prompt-library: remote command bridge is unavailable', error)
        }
      }

      ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'prompt-library: dictionaries')

      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.panellist', () =>
            ctx.slots.register(
              {
                name: 'sidebar.panellist',
                id: PANEL_ID,
                order: 20,
                label: () => t('panel.label'),
                locale: NS,
              },
              PromptLibraryIcon,
            ),
          ),
        'prompt-library: sidebar entry',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('main', () =>
            ctx.slots.register(
              {
                name: 'main',
                key: PANEL_ID,
                locale: NS,
                inject: () => ({
                  onBack: () => ctx.layout.selectPanel('conversation'),
                  onScenePromptChange: applyScenePrompt,
                  onUse: (body, hasSession) => {
                    if (hasSession) {
                      requestInsertion(body)
                      ctx.layout.selectPanel('conversation')
                      return
                    }
                    try {
                      ctx.layout.selectPanel('conversation')
                      ctx.uiWorkspace.startSession(undefined, { prompt: body, clearPreviousDraft: true })
                    } catch (error) {
                      console.error('prompt-library: could not start a conversation', error)
                    }
                  },
                }),
              },
              PromptLibraryPage,
            ),
          ),
        'prompt-library: main panel',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.left', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.left',
                id: PANEL_ID,
                order: 20,
                locale: NS,
              },
              ComposerTrigger,
            ),
          ),
        'prompt-library: composer trigger',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.dock', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.dock',
                id: 'prompt-library-scenes',
                order: 10,
                label: () => t('scenes.label'),
                locale: NS,
                inject: () => ({
                  onScenePromptChange: applyScenePrompt,
                }),
              },
              ScenePromptDock,
            ),
          ),
        'prompt-library: scene prompt dock',
      )

      ctx.effect(
        () =>
          ctx.slots.inject('conversation.input.overlay', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.overlay',
                id: PANEL_ID,
                order: 20,
                locale: NS,
                inject: () => ({
                  onManage: () => {
                    setPickerOpen(false)
                    ctx.layout.selectPanel(PANEL_ID)
                  },
                }),
              },
              PromptPickerOverlay,
            ),
          ),
        'prompt-library: composer picker',
      )
    }

    const pluginExports = { inject: ['slots', 'locale', 'layout', 'uiWorkspace'], apply }
    if (typeof window !== 'undefined' && window.__DSH_PROMPT_LIBRARY_TEST__ === true) {
      pluginExports.__test = {
        EN,
        ZH,
        PRESET_SCENES,
        META_SCENES,
        parseGeneratedScene,
        importGeneratedScene,
        BUILTIN_CATEGORY_IDS,
        SCENE_PROMPT_MAX,
        scenePromptKey,
        sceneSelectionKey,
        normalizeScenePrompts,
        scenePromptFor,
        setUserScenePrompt,
        getScenePromptsSnapshot,
        setSceneSelection,
        getSceneSelection,
        getSceneSelectionSnapshot,
        renameSceneSelection,
        removeSceneSelectionByKey,
        buildItems,
        sceneCardsFor,
        ScenePromptDock,
        SceneManagerDialog,
        ImportSceneDialog,
        PromptLibraryPage,
      }
    }
    return pluginExports
  },
})
