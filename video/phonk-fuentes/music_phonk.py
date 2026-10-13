# Banda sonora épica de 40 s, sincronizada con los cortes del video
import numpy as np, wave, sys
SR = 44100; DUR = 31.5; N = int(SR * DUR)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(21)

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if j <= i: return
    s = sig[: j - i] * gain
    L[i:j] += s * (1 - pan) ** .5 * 1.0
    R[i:j] += s * (1 + pan) ** .5 * 1.0

def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / SR / d); return e

def lowpass(x, cut):
    # filtro de un polo, aplicado dos veces
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); p = 0.0
    for _ in range(2):
        out = np.empty_like(x)
        for k in range(len(x)):
            p = (1 - a) * x[k] + a * p; out[k] = p
        x = out
    return x

def lp_fast(x, cut):
    # pasa bajos por FFT (rápido, sin estado)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x))

def boom(dur=2.8, f0=110, f1=32, gain=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, .002, .9)
    nz = lp_fast(rng.standard_normal(n), 900) * env(n, .001, .12) * .9
    sub = np.tanh(2.2 * (s + nz))
    return sub * gain

def kick(gain=1.0):
    n = int(.45 * SR); tt = np.arange(n) / SR
    f = 45 + 120 * np.exp(-tt * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.8 * np.sin(ph) * env(n, .001, .16)) * gain

def tom(freq, gain=1.0):
    n = int(.35 * SR); tt = np.arange(n) / SR
    f = freq * (1 + .5 * np.exp(-tt * 25)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, .001, .14) + lp_fast(rng.standard_normal(n), 2500) * env(n, .001, .03) * .3
    return s * gain

def tick(gain=1.0):
    n = int(.06 * SR)
    return lp_fast(rng.standard_normal(n), 6000) * env(n, .0005, .012) * gain

def saw(freq, dur, cut, gain=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * freq * k * tt) / k for k in range(1, 14)) * .6
    s = lp_fast(s, cut) * env(n, .004, dur * .45)
    return s * gain

def pad(freqs, dur, gain=1.0, att=1.5, rel=2.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for fr in freqs:
        for det in (-.12, 0, .12):
            s += sum(np.sin(2 * np.pi * fr * (1 + det / 100) * k * tt + rng.uniform(0, 6)) / k ** 1.4 for k in range(1, 7))
    s = lp_fast(s, 1400)
    e = np.minimum(1, tt / att) * np.minimum(1, (dur - tt) / rel).clip(0, 1)
    return s / (len(freqs) * 3) * e * gain

def riser(dur, gain=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n)
    X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1 / SR); X *= 1 / (1 + (f / 3000) ** 2)
    nz = np.fft.irfft(X, n)
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (tt / dur) ** 2) / SR) * .25
    return (nz * .6 + sweep) * (tt / dur) ** 2.2 * gain


A1, C2, E2, F1, G1 = 55.0, 65.41, 82.41, 43.65, 49.0
def ping(f=1318.5, gain=.35):
    n = int(.7 * SR); tt = np.arange(n) / SR
    s = (np.sin(2*np.pi*f*tt) + .5*np.sin(2*np.pi*f*1.5*tt)) * env(n, .002, .18)
    return s * gain
def chime(base=880, gain=.3):
    out = np.zeros(int(1.2 * SR))
    for i, m in enumerate((1, 1.25, 1.5, 2)):
        p = ping(base * m, gain * (1 - i * .12)); k = int(i * .07 * SR); out[k:k + len(p)] += p[: len(out) - k]
    return out
def pop(gain=.4):
    n = int(.12 * SR); tt = np.arange(n) / SR
    f = 900 * np.exp(-tt * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .03) * gain
def whoosh(dur=.5, gain=.5, up=True):
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1/SR)
    X *= np.exp(-((f - 2500) / 2200) ** 2); nz = np.fft.irfft(X, n)
    e = (tt / dur) ** 2 if up else (1 - tt / dur) ** 2
    return nz / (np.abs(nz).max() + 1e-9) * e * gain
def heart(gain=.8):
    return kick(gain) + np.concatenate([np.zeros(int(.18 * SR)), kick(gain * .7)])[: int(.45 * SR)]
def choir(freqs, dur, gain=.3, att=1.0, rel=1.5):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for fr in freqs:
        for det in (-.25, -.08, .08, .25):
            vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * tt + rng.uniform(0, 6))
            ph = 2 * np.pi * np.cumsum(fr * (1 + det / 100) * vib) / SR
            s += sum(np.sin(k * ph) / k for k in range(1, 10))
    X = np.fft.rfft(s); f = np.fft.rfftfreq(n, 1/SR)
    X *= np.exp(-((f - 750) / 380) ** 2) + .8 * np.exp(-((f - 1150) / 300) ** 2) + .3 * np.exp(-((f - 2600) / 500) ** 2)
    s = np.fft.irfft(X, n)
    e = np.minimum(1, tt / att) * np.clip((dur - tt) / rel, 0, 1)
    return s / (np.abs(s).max() + 1e-9) * e * gain



# ─────────── Phonk de gimnasio original · 130 bpm · Fa# menor ───────────
b = 60 / 130; bar = 4 * b; s16 = b / 4
def nota(m): return 440 * 2 ** ((m - 69) / 12)

def snare(gain=1.0):
    n = int(.28 * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1/SR)
    X *= np.exp(-((f - 2500) / 2500) ** 2) + .3; nz = np.fft.irfft(X, n)
    return (np.tanh(2 * nz / (np.abs(nz).max() + 1e-9)) * env(n, .001, .09) + np.sin(2 * np.pi * 200 * tt) * env(n, .001, .05) * .6) * gain
def clap(gain=1.0):
    out = np.zeros(int(.3 * SR))
    for k, d in enumerate((0, .011, .022)):
        s = snare(gain * (.6 if k < 2 else 1)); i = int(d * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out
def hat(gain=.3, abierto=False):
    n = int((.25 if abierto else .06) * SR)
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1/SR); X *= (f > 8000)
    return np.fft.irfft(X, n) * env(n, .0005, .08 if abierto else .018) * gain * 3
def kick_p(gain=1.0):
    n = int(.3 * SR); tt = np.arange(n) / SR
    f = 50 + 160 * np.exp(-tt * 40); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.5 * np.sin(ph) * env(n, .001, .1)) * gain
def b808(m, dur, gain=1.0, glide_to=None):
    n = int(dur * SR); tt = np.arange(n) / SR
    f0 = nota(m); f1 = nota(glide_to) if glide_to else f0
    f = f0 + (f1 - f0) * np.clip((tt - dur * .55) / (dur * .25), 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + .25 * np.sin(2 * ph)
    s = np.tanh(3.2 * s) * env(n, .004, dur * .9)
    return lp_fast(s, 900) * gain
def cencerro(m, gain=.3, dur=.22):
    n = int(dur * SR); tt = np.arange(n) / SR; f = nota(m)
    sq = lambda fr: np.sign(np.sin(2 * np.pi * fr * tt))
    s = sq(f) + sq(f * 1.48)
    X = np.fft.rfft(s); fr = np.fft.rfftfreq(n, 1/SR); X *= np.exp(-((fr - f * 1.9) / (f * 1.3)) ** 2); s = np.fft.irfft(X, n)
    return s / (np.abs(s).max() + 1e-9) * env(n, .001, .07) * gain

# riff del cencerro (original), en semicorcheas: notas MIDI o None
RT = 66  # Fa#
riff = [RT+12, None, RT+12, RT+15, None, RT+12, RT+10, None, RT+12, None, RT+7, None, RT+10, RT+12, None, RT+3,
        RT+12, None, RT+12, RT+15, None, RT+17, RT+15, None, RT+12, None, RT+10, RT+7, None, RT+5, RT+7, None]
bajo = [(RT-24, 2 * b, None), (RT-24, b, None), (RT-27, b, RT-24), (RT-22, 2 * b, None), (RT-21, 2 * b, RT-26)]

def compas_riff(t0, gain=.3, filtro=None):
    for i, m in enumerate(riff[:16] if int((t0 / bar) + .01) % 2 == 0 else riff[16:]):
        if m is None: continue
        s = cencerro(m, gain)
        if filtro: s = lp_fast(s, filtro)
        add(s, t0 + i * s16, pan=.15 if i % 2 else -.15)
def bateria(t0, compases, rolls=True, energia=1.0):
    for c in range(compases):
        tc = t0 + c * bar
        for k in range(4):
            tb = tc + k * b
            if k in (0, 2): add(kick_p(.9 * energia), tb)
            if k == 2 and c % 2: add(kick_p(.6 * energia), tb + b * .75)
            if k in (1, 3): add(clap(.7 * energia), tb)
            add(hat(.28), tb, pan=.35); add(hat(.2), tb + b / 2, pan=.35)
        if rolls and c % 2 == 1:
            for j in range(8): add(hat(.18 + .02 * j), tc + 3 * b + j * b / 8, pan=-.3)
def bajos(t0, compases, gain=.9):
    for c in range(compases):
        t = t0 + c * bar
        seq = bajo if c % 2 == 0 else [(RT-24, 2 * b, None), (RT-24, b, None), (RT-19, b, None), (RT-22, 2 * b, RT-24), (RT-24, 2 * b, None)]
        tt = t
        for m, d, gl in seq[:4]:
            add(b808(m, d * .98, gain, gl), tt); tt += d
            if tt >= t + bar - 1e-6: break

T = lambda n: n * bar   # inicio del compás n (desde 0)

# 0–2: intro. riff filtrado + hats + subida
compas_riff(T(0), .36, filtro=2200); compas_riff(T(1), .36, filtro=3200)
for k in range(4): add(kick_p(.75), T(0) + k * b); add(b808(RT-24, b * .9, .5), T(0) + k * b)
add(boom(1.2, 170, 40, .7), 0.0)
for k in range(8): add(hat(.18), T(0) + k * b / 2 + T(1) * (k >= 8))
for k in range(16): add(hat(.15 + .01 * k), T(1) + k * s16)
for k in range(4): add(kick_p(.5), T(1) + k * b)
add(riser(bar * 1.3, .8), T(2) - bar * 1.3)
add(whoosh(.5, .5), T(2) - .5)
# 2–8: drop
add(boom(2.2, 160, 30, 1.1), T(2))
for c in range(2, 8): compas_riff(T(c), .3)
bateria(T(2), 6); bajos(T(2), 6)
for c in range(2, 8): add(whoosh(.25, .22), T(c) + 2 * b - .25)
# 8–10: corte. pad + riff suelto + 808 largo
add(pad([nota(RT-12), nota(RT-9), nota(RT-5)], T(2) + .2, .5, att=.4, rel=.8), T(8))
add(choir([nota(RT), nota(RT+3), nota(RT+7)], T(2), .25, att=.6, rel=.6), T(8))
add(b808(RT-24, bar * 1.9, .7), T(8))
for i in (0, 3, 6, 10, 12): add(cencerro(RT+12 if i != 6 else RT+15, .22), T(8) + i * s16)
for i in (0, 3, 6, 10, 12): add(cencerro(RT+10 if i != 6 else RT+12, .22), T(9) + i * s16)
add(riser(bar, .7), T(10) - bar)
# 10–12: la oferta. groove sin cencerro
add(boom(1.6, 150, 35, .8), T(10))
bateria(T(10), 2, rolls=False, energia=.9); bajos(T(10), 2, .8)
for c in (10, 11): compas_riff(T(c), .14, filtro=1800)
# 12–14: subida
bateria(T(12), 1, energia=.9); bajos(T(12), 1, .8); compas_riff(T(12), .25)
for k in range(16): add(snare(.2 + .5 * k / 16), T(13) + k * s16)
for k in range(8): add(kick_p(.5 + .05 * k), T(13) + k * b / 2)
add(riser(bar * 1.5, 1.0), T(14) - bar * 1.5)
# 14–16: drop final
add(boom(2.5, 170, 28, 1.3), T(14))
for c in (14, 15): compas_riff(T(c), .32)
bateria(T(14), 2); bajos(T(14), 2)
# cola
add(boom(3.0, 150, 26, 1.1), T(16))
add(b808(RT-24, 2.4, .8), T(16))
add(cencerro(RT+12, .3), T(16)); add(cencerro(RT+19, .25, .4), T(16) + s16 * 2)
mix = np.stack([L, R], 1)
# reverb simple (eco difuso) y normalización
rev = np.zeros_like(mix)
for d, g in ((.031, .35), (.047, .3), (.071, .25), (.113, .2), (.167, .15)):
    k = int(d * SR); rev[k:] += mix[:-k] * g
mix = mix + rev * .5
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) * .9
mix = mix / np.abs(mix).max() * .89
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
