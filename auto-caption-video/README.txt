================================================================================
Auto-caption video — kompyuteringizda lokal "robot" (CapCut uslubida emas, lekin
matndan vertikal 9:16 video + ixtiyoriy ovoz)
================================================================================

1) FFmpeg o'rnating (PATH da bo'lsin)
   Windows PowerShell (admin):
     winget install ffmpeg

2) Python paketlar
   cd auto-caption-video
   pip install -r requirements.txt

3) Matn: har bir slayd — bo'sh qator bilan ajratilgan (captions_sample.txt ga qarang)

4) Video (faqat matn, har slayd 3.5 s)
   python make_video.py -i captions_sample.txt -o video.mp4

4b) Aniq 10 daqiqa (600 s) — slaydlarga teng bo'linadi (TTS yo'q)
   python make_video.py -i uzun_matn.txt -o on_min.mp4 --target-seconds 600

5) Video + ovoz (Edge TTS, Internet kerak, API kalit shart emas)
   python make_video.py -i captions_sample.txt -o video.mp4 --tts

   10 daqiqaga cho'zish (ovoz qisqa bo'lsa — oxirgi kadr + jimlik qo'shiladi):
   python make_video.py -i uzun_matn.txt -o on_min.mp4 --tts --target-seconds 600

   Boshqa til:
   python make_video.py -i captions.txt -o out.mp4 --tts --lang ru-RU-DmitryNeural

   Mavjud ovozlar ro'yxati:
   edge-tts --list-voices

Cheklovlar: bu CapCut emas — effektlar, perehodlar, muzika miks minimal.
Keyin CapCutda ochib bezatishingiz mumkin.

================================================================================
