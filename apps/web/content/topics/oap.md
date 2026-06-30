---
title: OAP
slug: oap
type: topic
date: 2026-06-30
---

# 单纯形法

## 标准形式

# 对偶单纯形法

# column generation 列生成法

## 过程

1.  初始化。 需要有各个方案、各个方案的花费、需求
2.  求解 RMP
3.  定价子问题
4.  列的评估与添加
5.  迭代
6.  终止

## Python 实例

假设我们有固定长度的原材料（例如，长度为15的木材），需要切割成不同长度的小块（例如，长度为4、6和7），以满足特定的需求数量（例如，分别需要80、50和100块）。目标是最小化使用原材料的数量。​

``` python
# 问题数据
class Data:
    num_small_types = 3   # 小块的种类数
    small_rod_demands = [80, 50, 100]  # 每种小块的需求量
    small_rod_sizes = [4, 6, 7]        # 每种小块的长度
    large_rod_size = 15                # 大型原材料的长度

# 初始化受限主问题（RMP）
def initialize_rmp(data):
    # 初始切割模式：每种小块长度的单独模式
    patterns = []
    for i in range(data.num_small_types):
        pattern = [0] * data.num_small_types
        pattern[i] = data.large_rod_size // data.small_rod_sizes[i]
        patterns.append(pattern)
    return patterns

# 使用单纯形法求解线性规划问题
def simplex(c, A, b):
    from scipy.optimize import linprog
    res = linprog(c, A_eq=A, b_eq=b, method='simplex')
    return res.x, res.fun, res.success, res.slack, res.status, res.message

# 求解定价子问题，寻找新的切割模式
def solve_subproblem(data, dual_values):
    # 定价子问题是一个背包问题，目标是最大化 reduced cost
    from itertools import product
    best_pattern = None
    best_value = float('-inf')
    # 枚举所有可能的切割模式
    for pattern in product(range(data.large_rod_size + 1), repeat=data.num_small_types):
        total_length = sum(pattern[i] * data.small_rod_sizes[i] for i in range(data.num_small_types))
        if total_length <= data.large_rod_size:
            value = sum(pattern[i] * dual_values[i] for i in range(data.num_small_types))
            if value > best_value:
                best_value = value
                best_pattern = pattern
    return best_value, best_pattern

# 更新主问题，添加新的切割模式
def update_rmp(patterns, new_pattern):
    patterns.append(new_pattern)

# 主函数：列生成算法
def column_generation(data):
    patterns = initialize_rmp(data)
    iteration = 0

    while True:
        iteration += 1
        # 构建RMP的目标函数和约束
        c = [1] * len(patterns)
        A = []
        for i in range(data.num_small_types):
            A.append([pattern[i] for pattern in patterns])
        b = data.small_rod_demands

        # 求解主问题
        solution, obj_value, success, slack, status, message = simplex(c, A, b)
        if not success:
            print("线性规划求解失败:", message)
            break

        # 获取对偶变量
        dual_values = slack

        # 求解定价子问题
        obj_value, new_pattern = solve_subproblem(data, dual_values)

        # 如果无法找到新的有利切割模式，停止迭代
        if obj_value <= 1 + 1e-6:
            break

        # 更新主问题，添加新的切割模式
        update_rmp(patterns, new_pattern)

    # 输出最终结果
    print("Optimal number of large rods used:", obj_value)
    for i, pattern in enumerate(patterns):
        print(f"Pattern {i}: {pattern}")

# 运行列生成算法
data = Data()
column_generation(data)

```

## emacs-lisp 的实现

``` {.commonlisp org-language="emacs-lisp"}
(defun write-glpk-input (filename constraints objective)
  "将线性规划问题写入GLPK输入文件。"
  (with-temp-file filename
    (insert "param n, integer, >= 1;\n")
    (insert "var x{i in 1..n} >= 0;\n")
    (insert (format "maximize obj: %s;\n" objective))
    (insert "s.t.\n")
    (dolist (constraint constraints)
      (insert (format "  %s\n" constraint)))
    (insert "end;\n")))

(defun solve-lp-with-glpk (input-file output-file)
  "调用GLPK求解线性规划问题。"
  (shell-command (format "glpsol --math %s -o %s" input-file output-file)))

(defun parse-glpk-output (output-file)
  "解析GLPK的输出，提取解和对偶变量。"
  ;; 实现解析逻辑，提取所需信息
  )

(defun column-generation ()
  "列生成法的主函数。"
  (let ((input-file "lp_problem.mod")
        (output-file "lp_solution.txt")
        (constraints '("x1 + x2 <= 10;" "x1 - x2 >= 3;"))
        (objective "5*x1 + 3*x2"))
    (write-glpk-input input-file constraints objective)
    (solve-lp-with-glpk input-file output-file)
    (let ((solution (parse-glpk-output output-file)))
      ;; 根据解和对偶变量，决定是否添加新的变量（列）
      ;; 如果需要，更新constraints和objective，然后重复上述过程
      )))
```
