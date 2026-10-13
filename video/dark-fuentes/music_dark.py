# Banda sonora épica de 40 s, sincronizada con los cortes del video
import numpy as np, wave, sys
SR = 44100; DUR = 34.0; N = int(SR * DUR)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

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


# ─────────── Rock oscuro original, 96 bpm, Mi menor ───────────
b = 60 / 96
E1, E2, B1, C2_, D2, G2 = 41.20, 82.41, 61.74, 65.41, 73.42, 98.0

def snare(gain=1.0):
    n = int(.32 * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1/SR)
    X *= np.exp(-((f - 3800) / 3000) ** 2) + .4; nz = np.fft.irfft(X, n)
    body = np.sin(2 * np.pi * 185 * tt) * env(n, .001, .07)
    return (nz / (np.abs(nz).max() + 1e-9) * env(n, .001, .11) * .9 + body * .7) * gain

def hat(gain=.3):
    n = int(.08 * SR)
    nz = rng.standard_normal(n); X = np.fft.rfft(nz); f = np.fft.rfftfreq(n, 1/SR); X *= (f > 7000)
    return np.fft.irfft(X, n) * env(n, .0005, .02) * gain * 3

def guitar(root, dur, gain=1.0, mute=False):
    """quinta + octava con distorsión (saw desafinada + tanh)"""
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for fr in (root * 2, root * 3, root * 4):
        for det in (-.18, .0, .21):
            ph = 2 * np.pi * fr * (1 + det / 100) * tt + rng.uniform(0, 6)
            s += ((ph / np.pi) % 2 - 1)
    s = np.tanh(s * 2.6)
    s = lp_fast(s, 2600 if not mute else 1300)
    e = env(n, .003, .09 if mute else dur * .9)
    return s / (np.abs(s).max() + 1e-9) * e * gain

def piano(fr, gain=.3, dur=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fr * k * tt) * np.exp(-tt * (2 + k * 1.3)) / k ** 1.2 for k in range(1, 7))
    return s * env(n, .003, dur * .5) * gain

def impacto(t0, g=1.0):
    add(boom(3.2, 150, 26, 1.3 * g), t0)
    add(whoosh(.55, .5 * g, up=True), t0 - .55)

# 0 – 6: intro. drone, latido y piano oscuro
add(pad([E1 * 2, B1 * 2], 6.2, gain=.5, att=2.5, rel=.3), 0)
add(choir([E2 * 2, G2 * 2], 6.0, .16, att=3, rel=.2), 0)
for s in np.arange(0.2, 5.8, b * 2): add(heart(.6), s)
mel = [329.6, 392.0, 493.9, 392.0, 329.6, 392.0, 523.3, 493.9, 293.7, 369.99, 440.0, 369.99]
for i, fr in enumerate(mel): add(piano(fr, .22), .3 + i * b / 1.5, pan=(-.3 if i % 2 else .3))
add(riser(1.6, .7), 4.4)

# progresión i – VI – VII – v (Mi, Do, Re, Si), un compás cada uno
prog = [E2 / 2, C2_, D2, B1]

def seccion(t0, compases, energia=1.0, muteo=True, dobles=False):
    for c in range(compases):
        root = prog[c % 4]; tc = t0 + c * 4 * b
        if muteo:
            for k in range(8): add(guitar(root, b / 2, .55 * energia, mute=True), tc + k * b / 2, pan=-.35); add(guitar(root, b / 2, .5 * energia, mute=True), tc + k * b / 2 + .012, pan=.35)
        else:
            add(guitar(root, 4 * b, .5 * energia), tc, pan=-.35); add(guitar(root, 4 * b, .46 * energia), tc + .015, pan=.35)
        # bajo
        n = int(4 * b * SR); tt = np.arange(n) / SR
        add(np.tanh(1.5 * np.sin(2 * np.pi * root * tt)) * env(n, .005, 4 * b) * .5 * energia, tc)
        for k in range(4):
            tb = tc + k * b
            if k in (0, 2): add(kick(.95 * energia), tb)
            if k == 2 and c % 2: add(kick(.7 * energia), tb + b / 2)
            if k in (1, 3): add(snare(.75 * energia), tb)
            add(hat(.35), tb, pan=.4); add(hat(.25), tb + b / 2, pan=.4)
            if dobles: add(hat(.2), tb + b / 4, pan=-.4); add(hat(.2), tb + 3 * b / 4, pan=-.4)

# 6: el golpe
impacto(6.0, 1.2)
add(choir([E2 * 2, B1 * 4, E2 * 4], 6.0, .45, att=.05, rel=1), 6.0)
seccion(6.0, 4, 1.0, muteo=True)                       # 6.0 – 16.0
# 9: medidor de poder: golpes y tic
for k in range(10): add(tick(.4), 9.0 + k * .28)
# 12 – 20: la app. acordes abiertos + piano arriba
seccion(16.0, 2, .9, muteo=False)                      # 16.0 – 21.0
for i, fr in enumerate([659.3, 783.99, 987.8, 783.99] * 4): add(piano(fr, .14, 1.0), 12.0 + i * b / 2, pan=.2)
for cut in (12.0, 14.0, 16.0, 18.0): add(whoosh(.35, .35), cut - .35)
# 20 – 24: tres poderes y la subida
for i, s in enumerate((20.3, 21.3, 22.3)): add(choir([E2 * 4 * (1.26 ** i)], 1.4, .3, att=.05, rel=.6), s); add(boom(1.4, 140, 40, .6), s)
for k in range(16): add(snare(.25 + .5 * k / 16), 22.0 + k * b / 4)
add(riser(2.0, 1.0), 22.0)
# 24: transformación
impacto(24.0, 1.4)
add(choir([E2 * 2, B1 * 4, E2 * 4, G2 * 4], 4.0, .55, att=.02, rel=.8), 24.0)
seccion(24.0, 2, 1.1, muteo=True, dobles=True)        # 24.0 – 29.0
# 28: final
impacto(28.4, 1.1)
add(guitar(E2 / 2, 5.5, .55), 28.4, pan=-.3); add(guitar(E2 / 2, 5.5, .5), 28.42, pan=.3)
add(choir([E2 * 2, B1 * 4, E2 * 4], 5.6, .5, att=.03, rel=3.0), 28.4)
add(pad([E1 * 2, B1 * 2, E2 * 2], 5.6, .4, att=.03, rel=3.0), 28.4)
for k in range(4): add(tom(110 - k * 15, .5), 28.4 + k * b / 2)
mix = np.stack([L, R], 1)
# reverb simple (eco difuso) y normalización
rev = np.zeros_like(mix)
for d, g in ((.031, .35), (.047, .3), (.071, .25), (.113, .2), (.167, .15)):
    k = int(d * SR); rev[k:] += mix[:-k] * g
mix = mix + rev * .5
fade = np.ones(N); fn = int(2.5 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) * .9
mix = mix / np.abs(mix).max() * .89
pcm = (mix * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
