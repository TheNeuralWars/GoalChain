(module
  (memory 1)
  (export "memory" (memory 0))

  ;; Allocator
  (global $heap_ptr (mut i32) (i32.const 1024))
  (func $alloc (param $size i32) (result i32)
    (local $old i32)
    global.get $heap_ptr
    local.set $old
    global.set $heap_ptr (i32.add (global.get $heap_ptr) (local.get $size))
    local.get $old
  )
  (export "alloc" (func $alloc))

  (func $free (param $ptr i32))
  (export "free" (func $free))

  ;; RNG
  (global $rng_state (mut i32) (i32.const 123456789))
  (func $rng (result i32)
    global.set $rng_state (i32.add (i32.mul (global.get $rng_state) (i32.const 1664525)) (i32.const 1013904223))
    global.get $rng_state
  )

  ;; Parse commentary - simplified version
  (func $parse_commentary (param $eventType i32) (param $homeStrength i32) (param $awayStrength i32) (param $playerSpeed i32) (param $playerShotPower i32) (param $playerStamina i32) (param $matchMinute i32) (param $scoreDiff i32) (param $isHomeTeam i32) (param $outputPtr i32)
    (local $excitement f64)
    (local $tension f64)
    (local $celebration f64)
    (local $analytical f64)
    (local $templateIdx f64)

    ;; Default weights
    local.set $excitement (f64.const 0.3)
    local.set $tension (f64.const 0.3)
    local.set $celebration (f64.const 0.0)
    local.set $analytical (f64.const 0.4)
    local.set $templateIdx (f64.const 0)

    ;; Event-specific weights using select
    ;; GOAL (3)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 1.0)
        (i32.eq (local.get $eventType) (i32.const 3))
      )
    local.set $celebration
      (select
        (local.get $celebration)
        (f64.const 1.0)
        (i32.eq (local.get $eventType) (i32.const 3))
      )
    local.set $tension
      (select
        (local.get $tension)
        (f64.const 0.0)
        (i32.eq (local.get $eventType) (i32.const 3))
      )

    ;; SHOT (2)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 0.6)
        (i32.eq (local.get $eventType) (i32.const 2))
      )
    local.set $tension
      (select
        (local.get $tension)
        (f64.const 0.8)
        (i32.eq (local.get $eventType) (i32.const 2))
      )

    ;; RED_CARD (10)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 0.8)
        (i32.eq (local.get $eventType) (i32.const 10))
      )
    local.set $tension
      (select
        (local.get $tension)
        (f64.const 0.9)
        (i32.eq (local.get $eventType) (i32.const 10))
      )

    ;; PENALTY (15)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 0.9)
        (i32.eq (local.get $eventType) (i32.const 15))
      )
    local.set $tension
      (select
        (local.get $tension)
        (f64.const 1.0)
        (i32.eq (local.get $eventType) (i32.const 15))
      )

    ;; KICKOFF (0)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 0.7)
        (i32.eq (local.get $eventType) (i32.const 0))
      )
    local.set $tension
      (select
        (local.get $tension)
        (f64.const 0.2)
        (i32.eq (local.get $eventType) (i32.const 0))
      )
    local.set $celebration
      (select
        (local.get $celebration)
        (f64.const 0.1)
        (i32.eq (local.get $eventType) (i32.const 0))
      )

    ;; FULLTIME (12)
    local.set $excitement
      (select
        (local.get $excitement)
        (f64.const 0.6)
        (i32.eq (local.get $eventType) (i32.const 12))
      )
    local.set $celebration
      (select
        (local.get $celebration)
        (f64.const 0.7)
        (i32.eq (local.get $eventType) (i32.const 12))
      )

    ;; HALFTIME (11)
    local.set $analytical
      (select
        (local.get $analytical)
        (f64.const 0.8)
        (i32.eq (local.get $eventType) (i32.const 11))
      )

    ;; Template index with RNG for variety events
    local.set $templateIdx
      (select
        (local.get $templateIdx)
        (f64.convert_i32_s (i32.and (call $rng) (i32.const 3)))
        (i32.or
          (i32.eq (local.get $eventType) (i32.const 1))  ;; PASS
          (i32.eq (local.get $eventType) (i32.const 2))  ;; SHOT
          (i32.eq (local.get $eventType) (i32.const 3))  ;; GOAL
          (i32.eq (local.get $eventType) (i32.const 4))  ;; SAVE
          (i32.eq (local.get $eventType) (i32.const 5))  ;; FOUL
          (i32.eq (local.get $eventType) (i32.const 7))  ;; SUB
          (i32.eq (local.get $eventType) (i32.const 11)) ;; HALFTIME
          (i32.eq (local.get $eventType) (i32.const 12)) ;; FULLTIME
          (i32.eq (local.get $eventType) (i32.const 13)) ;; CORNER
          (i32.eq (local.get $eventType) (i32.const 14)) ;; FREE_KICK
          (i32.eq (local.get $eventType) (i32.const 15)) ;; PENALTY
        )
      )

    ;; Write output
    f64.store (local.get $outputPtr) (local.get $excitement)
    f64.store (i32.add (local.get $outputPtr) (i32.const 8)) (local.get $tension)
    f64.store (i32.add (local.get $outputPtr) (i32.const 16)) (local.get $celebration)
    f64.store (i32.add (local.get $outputPtr) (i32.const 24)) (local.get $analytical)
    f64.store (i32.add (local.get $outputPtr) (i32.const 32)) (local.get $templateIdx)
  )
  (export "parse_commentary" (func $parse_commentary))

  (func $start)
  (export "start" (func $start))
)