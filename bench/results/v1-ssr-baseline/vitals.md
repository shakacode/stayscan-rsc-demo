# v1-ssr-baseline — web vitals (prod-local, 2026-07-09T07:53Z)
# baseline-vs-baseline (a=b), the SSR page vitals the RSC migration measures against; A column = the baseline.

## path=/
  metric     A mean     A med     B mean     B med   Δ% (med)
    ttfb       22ms      19ms       18ms      18ms      -6.0%  (A sd 8ms)
     fcp       65ms      64ms       62ms      60ms      -6.3%  (A sd 10ms)
     lcp       65ms      64ms       62ms      60ms      -6.3%  (A sd 10ms)
     cls      0.000     0.000      0.000     0.000       0.0%  (A sd 0.000)
     dcl       60ms      55ms       50ms      49ms     -11.4%  (A sd 20ms)
    load      167ms     170ms      174ms     173ms       1.5%  (A sd 28ms)

## path=/listings/2
  metric     A mean     A med     B mean     B med   Δ% (med)
    ttfb       29ms      24ms       29ms      28ms      18.5%  (A sd 10ms)
     fcp       87ms      84ms       88ms      88ms       4.8%  (A sd 11ms)
     lcp       87ms      84ms       88ms      88ms       4.8%  (A sd 11ms)
     cls      0.000     0.000      0.000     0.000       0.0%  (A sd 0.000)
     dcl       66ms      65ms       56ms      55ms     -16.3%  (A sd 17ms)
    load      217ms     248ms      255ms     259ms       4.4%  (A sd 55ms)

## path=/s
  metric     A mean     A med     B mean     B med   Δ% (med)
    ttfb       33ms      32ms       35ms      33ms       3.9%  (A sd 3ms)
     fcp      109ms     108ms      116ms     112ms       3.7%  (A sd 5ms)
     lcp      109ms     108ms      116ms     112ms       3.7%  (A sd 5ms)
     cls      0.000     0.000      0.000     0.000       0.0%  (A sd 0.000)
     dcl       62ms      61ms       65ms      64ms       4.7%  (A sd 4ms)
    load      396ms     395ms      402ms     401ms       1.6%  (A sd 10ms)
