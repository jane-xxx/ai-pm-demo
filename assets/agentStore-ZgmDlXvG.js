var j=Object.defineProperty;var x=(r,t,e)=>t in r?j(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var h=(r,t,e)=>x(r,typeof t!="symbol"?t+"":t,e);import{A as P}from"./index-C4s5WSxo.js";const a={PROJECTS:"ai_pm_projects",AGENT_OUTPUTS:"ai_pm_agent_outputs",USER:"ai_pm_user",CONFIG:"ai_pm_config"},l=["split","user_analysis","competitor","solution","prd"],S=30;function A(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function N(r){return new Date(r).toLocaleDateString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}function I(r,t){return Date.now()-new Date(t).getTime()>r*24*60*60*1e3}class O{getProjects(){const t=localStorage.getItem(a.PROJECTS);return t?JSON.parse(t).filter(n=>n.status==="completed"?!0:!I(S,n.createdAt)):[]}saveProjects(t){localStorage.setItem(a.PROJECTS,JSON.stringify(t))}getProject(t){return this.getProjects().find(n=>n.id===t)||null}saveProject(t){const e=this.getProjects(),n=e.findIndex(s=>s.id===t.id);n>=0?e[n]=t:e.push(t),this.saveProjects(e)}deleteProject(t){const e=this.getProjects().filter(n=>n.id!==t);this.saveProjects(e)}getAgentOutputs(t){const e=localStorage.getItem(a.AGENT_OUTPUTS);return e?JSON.parse(e)[t]||[]:[]}saveAgentOutput(t){const e=localStorage.getItem(a.AGENT_OUTPUTS),n=e?JSON.parse(e):{};n[t.projectId]||(n[t.projectId]=[]);const s=n[t.projectId].findIndex(i=>i.id===t.id);s>=0?n[t.projectId][s]=t:n[t.projectId].push(t),localStorage.setItem(a.AGENT_OUTPUTS,JSON.stringify(n))}getUser(){const t=localStorage.getItem(a.USER);return t?JSON.parse(t):null}saveUser(t){localStorage.setItem(a.USER,JSON.stringify(t))}getConfig(){const t=localStorage.getItem(a.CONFIG);return t?JSON.parse(t):{mode:"mock"}}saveConfig(t){localStorage.setItem(a.CONFIG,JSON.stringify(t))}}const c=new O;class v{constructor(){h(this,"state",P({projects:[],currentProject:null}));this.loadProjects()}get projects(){return this.state.projects}get currentProject(){return this.state.currentProject}get hasCurrentProject(){return this.state.currentProject!==null}loadProjects(){this.state.projects=c.getProjects()}createProject(t){const e={id:A(),name:t.name,description:t.description,createdAt:new Date().toISOString(),currentStep:0,status:"draft"};return this.state.projects.unshift(e),c.saveProjects(this.state.projects),e}setCurrentProject(t){this.state.currentProject=t}updateProject(t){var n;const e=this.state.projects.findIndex(s=>s.id===t.id);e>=0&&(this.state.projects[e]=t),((n=this.state.currentProject)==null?void 0:n.id)===t.id&&(this.state.currentProject=t),c.saveProjects(this.state.projects)}deleteProject(t){var e;this.state.projects=this.state.projects.filter(n=>n.id!==t),((e=this.state.currentProject)==null?void 0:e.id)===t&&(this.state.currentProject=null),c.saveProjects(this.state.projects)}}const d=new v,C={split:r=>`# 需求拆解结果

## 项目概述
根据您的需求"${r.substring(0,50)}..."，识别出以下核心信息：

## 核心功能列表
1. 功能点一：基础功能实现
2. 功能点二：核心业务逻辑
3. 功能点三：高级特性

## 技术建议
- 推荐使用现代前端框架
- 考虑后续扩展性`,user_analysis:r=>`# 用户分析结果

## 目标用户画像

### 主要用户群体
- **年龄**: 25-40岁
- **职业**: 上班族/自由职业者
- **技术能力**: 中等

### 用户痛点
1. 现有解决方案效率低下
2. 缺乏针对性的工具
3. 学习成本高

### 用户需求
- 简单易用的界面
- 快速上手
- 稳定可靠`,competitor:r=>`# 竞品分析结果

## 主要竞品

| 竞品名称 | 优势 | 劣势 |
|---------|------|------|
| 产品A | 功能全面 | 价格昂贵 |
| 产品B | 价格便宜 | 功能简单 |

## 差异化优势
1. 更智能的AI能力
2. 更优的用户体验
3. 更具竞争力的价格`,solution:r=>`# 解决方案设计

## 功能详细描述

### 功能一：核心功能
**用户故事**: 作为用户，我希望能够快速完成XXX操作，以便提高效率

**实现要点**:
- 界面简洁直观
- 操作流程优化
- 错误提示友好

### 功能二：辅助功能
**用户故事**: 作为用户，我希望能够XXX，以便获得更好的体验`,prd:r=>`# 产品需求文档 (PRD)

## 1. 项目概述
本项目旨在解决用户在XXX场景下的问题...

## 2. 目标用户
- 主要用户群体：上班族、自由职业者
- 用户画像：25-40岁，中等技术能力

## 3. 核心功能
1. 功能点一：基础功能
2. 功能点二：核心业务
3. 功能点三：高级特性

## 4. 竞品分析
主要竞品包括产品A和产品B，我们的差异化优势在于...

## 5. 功能详细描述
(详见解决方案设计章节)

## 6. 用户故事
- 作为用户，我希望能够快速完成操作
- 作为管理员，我希望能够管理用户数据

## 7. 交互设计
- 主界面：简洁直观，核心功能一目了然
- 操作流程：减少操作步骤，提高效率

## 8. 技术限制
- 前端：Vue 3 + TypeScript
- 后端：待定
- 数据存储：localStorage

## 9. 项目里程碑
- 第一阶段：MVP功能开发
- 第二阶段：功能完善
- 第三阶段：性能优化

## 10. 成功指标
- 用户留存率 > 60%
- 用户满意度 > 4.0/5.0
- 核心功能使用率 > 80%`};function m(r,t){return C[r](t)}class E{constructor(){h(this,"config",{mode:"mock"})}setConfig(t){this.config=t}async executeAgent(t,e,n,s){await this.delay(1500);let i;return this.config.mode==="mock"?i=m(t,n):i=await this.callLLMAPI(t,n,s||[]),{id:A(),projectId:e,agentType:t,content:i,timestamp:new Date().toISOString(),isConfirmed:!1}}async callLLMAPI(t,e,n){return this.getSystemPrompt(t),this.buildUserPrompt(t,e,n),m(t,e)}getSystemPrompt(t){return{split:"你是一个产品需求分析师，擅长将模糊的产品想法拆解为具体的功能需求。",user_analysis:"你是一个用户研究专家，擅长分析目标用户群体和用户画像。",competitor:"你是一个竞品分析专家，擅长分析市场竞争格局和差异化优势。",solution:"你是一个解决方案设计师，擅长将需求转化为具体的产品方案。",prd:"你是一个技术作家，擅长编写清晰、完整的产品需求文档（PRD）。"}[t]}buildUserPrompt(t,e,n){return t==="split"?`请分析以下产品需求：
${e}`:`基于以下分析结果：
${n.map(i=>i.content).join(`

`)}

请完成${t}相关的分析。`}delay(t){return new Promise(e=>setTimeout(e,t))}}const w=new E;class T{constructor(){h(this,"state",P({executions:[],isExecuting:!1,currentAgentIndex:0,viewingAgent:null}))}get executions(){return this.state.executions}get isExecuting(){return this.state.isExecuting}get currentAgent(){return this.state.currentAgentIndex<l.length?l[this.state.currentAgentIndex]:null}get currentExecution(){return this.currentAgent?this.state.executions.find(t=>t.agentType===this.currentAgent):null}get hasMoreAgents(){return this.state.currentAgentIndex<l.length}get progress(){return{current:this.state.currentAgentIndex,total:l.length,completed:this.state.executions.filter(t=>t.status==="completed").length}}get viewingAgent(){return this.state.viewingAgent}get displayExecution(){var e;const t=this.state.executions.find(n=>n.status==="running");if(t)return t;if(this.state.viewingAgent)return this.state.executions.find(n=>n.agentType===this.state.viewingAgent);if(!this.currentAgent){const n=this.state.executions.find(s=>s.agentType==="prd");if((e=n==null?void 0:n.output)!=null&&e.isConfirmed)return n}return this.currentExecution}canViewAgent(t){const e=this.state.executions.find(n=>n.agentType===t);return(e==null?void 0:e.status)==="completed"}setViewingAgent(t){t&&this.canViewAgent(t)?this.state.viewingAgent=t:this.state.viewingAgent=null}resetViewingAgent(){this.state.viewingAgent=null}initPipeline(t){this.state.executions=l.map(e=>({agentType:e,status:"pending"})),this.state.currentAgentIndex=0}async executeCurrent(t,e){var i;const n=this.currentAgent;if(console.log("executeCurrent 开始:",{agent:n,currentAgentIndex:this.state.currentAgentIndex}),!n)return null;const s=this.state.executions.find(g=>g.agentType===n);if(!s)return null;this.state.isExecuting=!0,s.status="running";try{const g=this.state.executions.filter(o=>o.status==="completed"&&o.output).map(o=>o.output),u=await w.executeAgent(n,t,e,g);if(s.status="completed",s.output=u,c.saveAgentOutput(u),n==="prd"&&u.content){u.isConfirmed=!0,c.saveAgentOutput(u),console.log("✅ PRD 输出已自动确认"),console.log("🎯 PRD agent 执行完成，开始保存...",{projectId:t,contentLength:u.content.length});const o=d.projects.find(f=>f.id===t);o?(o.prdContent=u.content,o.status="completed",d.updateProject(o),c.saveProject(o),console.log("✅ PRD 自动保存成功:",o.name,"PRD长度:",(i=o.prdContent)==null?void 0:i.length)):console.error("❌ 找不到项目:",t,"可用项目:",d.projects.map(f=>f.id)),this.state.currentAgentIndex++,console.log("✅ Pipeline 已完成，currentAgentIndex 递增为:",this.state.currentAgentIndex)}const p=d.currentProject;return p&&(p.currentStep=this.state.currentAgentIndex+1,n==="prd"&&u.isConfirmed?p.status="completed":p.status="in_progress",d.updateProject(p)),u}catch(g){return s.status="error",s.error=g instanceof Error?g.message:"Unknown error",null}finally{this.state.isExecuting=!1}}confirmCurrent(){var t;(t=this.currentExecution)!=null&&t.output&&(this.currentExecution.output.isConfirmed=!0,c.saveAgentOutput(this.currentExecution.output),this.state.currentAgentIndex++)}skipCurrent(){this.state.currentAgentIndex++}async retryCurrent(t,e){var s;const n=this.currentExecution;return n?(n.agentType==="prd"&&((s=n.output)!=null&&s.content)?(n.output.isConfirmed=!1,c.saveAgentOutput(n.output)):(n.status="pending",n.error=void 0,n.output=void 0),this.executeCurrent(t,e)):null}completePipeline(t){const e=d.currentProject;e&&(e.status="completed",e.prdContent=t,d.updateProject(e))}loadAgentOutputs(t){const e=c.getAgentOutputs(t);this.state.executions=l.map(s=>{const i=e.find(g=>g.agentType===s);return{agentType:s,status:i?"completed":"pending",output:i}});const n=this.state.executions.findIndex(s=>s.status!=="completed"||s.output&&!s.output.isConfirmed);this.state.currentAgentIndex=n>=0?n:l.length}}const U=new T;export{l as A,U as a,N as f,d as p,c as s};
