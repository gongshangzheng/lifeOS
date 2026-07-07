---
title: Voyage
slug: voyage
type: topic
date: 2026-06-30
---

1.  Lille -\> paris: 24 euros chaqun
2.  Prague hotel: 26.25 euro au total
3.  Prague -\> vienne: 25 euro chaqun
4.  Vienne hotel
5.  vienne staatsoper
6.  vienne -\> Budapeste: 17 euro chaqun
7.  Budapeste Hotel
8.  Paris -\> Lille

transportation:

``` {.commonlisp org-language="emacs-lisp" tangle="yes" comments="link"}
(setq lille-paris 47.97)
(setq prague-vienne 49.95)
(setq vienne-budapeste 33.97)
(setq paris-lille 32.97)
(setq bus (/ (+ lille-paris prague-vienne vienne-budapeste paris-lille) 2))
(setq paris-prague (* 2 71.71))
(setq prague-paris (+ 65.29 65.71))
(setq vol (/ (+ paris-prague prague-paris) 2))
(setq transportation (+ vol bus))
(message "bus: %f" bus)
(message "vol: %f" vol)
(message "transportation: %f" transportation)
;; (message "RMB: %f" (* 7.79 transportation))
```

``` {.commonlisp org-language="emacs-lisp" tangle="yes" comments="link"}
(setq accommodation/prague (/ 72.11 2))
(setq accommodation/vienne (- (/ 105 2)))
(setq emprunt 200)
(setq vol-amende -49.78)

(setq all (+ bus accommodation/vienne accommodation/prague emprunt vol-amende))
```
