---
title: 宠物动作识别
slug: pet-action-recognition
status: active
startDate: 2026-06-29
endDate: null
category: research
tags:
  - 宠物
  - 动作识别
  - 视频理解
  - 边缘部署
summary: 面向室内猫咪居家场景的端侧宠物行为识别摄像头产品，核心能力包括实时行为识别、异常场景告警、亮点抓取与结构化事件输出，BOM 成本约束 500 元以内。
timeline:
  - date: 2026-06-29
    title: 项目启动
    type: milestone
    description: 宠物动作识别项目正式启动，定义行为分类体系与硬件约束。
  - date: 2026-07-06
    title: Phase 1 调研完成
    type: milestone
    description: 完成动作检测模型全景调研（mmaction2 25+ 模型、SSM/Transformer 新架构）与动物行为数据集搜集（9 个数据集），输出选型建议。
---

## 项目背景

面向室内猫咪居家场景的端侧宠物行为识别摄像头产品。核心能力包括实时行为识别、异常场景告警、亮点抓取与结构化事件输出，在 **500 元以内的硬件 BOM 成本约束**下完成落地。

端侧芯片预计为 RV11xx/H28xx 级别 NPU SoC，算力 0.5-1.0 TOPS，模型需极端量化（INT8）+ 剪枝才能实现实时推理（>15fps）。

### 核心矛盾

人类动作检测模型已相当成熟，但猫的运动模式、骨架结构、行为语义与人类差异巨大。Phase 1 的核心任务就是搞清楚这个 gap 有多大，现有方法迁移过来的效果下界在哪里。

## 行为分类体系

### 常见场景（9 类）

活动（走/跑/跳）、进食、饮水、如厕、长时间静止（>5min）、多宠追逐、多宠打闹、舔毛、猫咪叫。

### 异常场景（4 大类）

- **分类 1（紧急）**：呕吐、抽搐 → 立即推送
- **分类 2（破坏）**：用手拨东西/抓挠、啃咬 → 事件记录
- **分类 3（扰民）**：持续叫 → 事件记录
- **分类 4（安全）**：跳跃、跌落 → 条件推送

> 端云协同策略：端侧标记"异常"+ 大类，关键帧上报云端进一步识别。

## 技术路线（Phase 1 调研结论）

### 推荐分层架构

1. **Layer 1**：YOLOv8/v11 猫检测 + ByteTrack 跟踪
2. **Layer 2（可选）**：SuperAnimal 零样本姿态估计
3. **Layer 3a**：X3D-M 或 TSM+MobileNetV2 常见行为分类（从 Animal Kingdom 迁移）
4. **Layer 3b**：VideoMAE 重建误差异常检测（呕吐/抽搐无公开数据）
5. **Layer 4**：时序聚合 + 规则引擎 → 结构化事件输出

### 五个核心判断

1. RGB 路线优先于骨架路线（猫科姿态估计虽有 SuperAnimal 兜底，但 pipeline 复杂度更高）
2. 常见行为技术路线已清晰（Animal Kingdom + X3D-M fine-tune）
3. 异常行为是真正的难题（呕吐/抽搐在所有公开数据中完全空白）
4. 知识蒸馏是精度与效率的桥梁（VideoMAE V2 → X3D-M，精度损失 2-4%）
5. SSM 部署还不成熟（VideoMamba 算子缺乏 NPU 支持，作为技术储备）

## 阶段规划

1. **Phase 1（已完成）**：模型验证 + Benchmark 搭建
2. **Phase 2（进行中）**：两阶段方案调研 + 深入各条检测路线 + 重点方案实现
3. **Phase 3**：端侧部署 + 系统集成
4. **Phase 4**：产品化 + 硬件 BOM 定型

## 参考资料

- [动作识别系列（一）：第一阶段任务规划](https://gongshangzheng.github.io/pet-action-detection-phase1)
- [动作识别系列（二）：模型全景与选型](https://gongshangzheng.github.io/pet-action-detection-model-survey)
