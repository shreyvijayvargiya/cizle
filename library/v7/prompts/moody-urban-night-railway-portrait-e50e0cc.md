# Moody Urban Night Railway Portrait

By @alejandro.garcia.garay@gmail.com · general
Language: en · Domains: entertainment, health · Source: P01

Source page: https://prompts.chat

```
A vertical nighttime photograph of a young woman standing outdoors
next to metal stairs near a railway. She has light skin, brown hair
pulled back into a low ponytail with loose strands framing her face
and falling over her forehead, defined eyebrows, and a serious,
pensive expression. She is wearing an oversized brown leather bomber
jacket with visible zipper and ribbed cuffs, a black crew-neck
t-shirt underneath, and a pleated olive green military-style mini
skirt. She stands slightly turned, with her arms crossed over her
chest, looking off to the left side of the frame, avoiding eye
contact with the camera. The setting is an industrial area near train
tracks: metal stairs with white railing on the right going up an
embankment, metal catenary poles and railway electrification
structures in the background, an electrical control box on the upper
right, and a tall street light pole on the upper left. The steep
slope behind her is covered in green grass and dirt. The night sky is
dark grey-purple. Strong artificial light from a street lamp in the
upper left corner creates a slight lens flare, casting hard direct
light on her face and jacket. Shot from a slightly low angle,
American shot framing. Photorealistic, high detail, cinematic
lighting, moody urban night atmosphere, 8k, masterpiece, best
quality, ultra-detailed, sharp focus.


Negative
Prompt:
cartoon, anime,
illustration, painting, drawing, 3d render, cgi, deformed, distorted,
bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra
limb, ugly, poorly drawn hands, missing limb, floating limbs,
disconnected limbs, malformed hands, out of focus, extreme zoom,
absurd, blurry, wet, watermark, signature, text, username, artist
name, low quality, worst quality, normal quality, lowres, jpeg
artifacts, dead, out of frame, cropped, mutation, mutilated, out of
frame, extra fingers, too many fingers, cross-eyed, bad hands,
missing fingers, extra digit, fewer digits, cropped, worst quality,
low quality, normal quality, jpeg artifacts, signature, watermark,
username, blurry, artist name, monochrome, grayscale, duplicate,
morbid, mutilated, out of frame, extra toes, crossed eyes.

sd_xl_base_1.0.safetensors o Juggernaut XL v9
Resolution: 832x1216
(9:16 aspect ratio)
Steps: 30-40
Sampler: DPM++ 2M
Karras o Euler a
CFG Scale: 7-8
Clip Skip: 2 (para
SD 1.5) / 1 (para SDXL)
Denoising Strength:
0.75 (si usas img2img)

IP-Adapter Weight:
0.6-0.8
IP-Adapter Model:
ip-adapter-plus_sd15.safetensors
Reference Image: La
imagen original de la modelo

ControlNet Unit 0:
  Model:
control_v11p_sd15_openpose
  Preprocessor:
openpose_full
  Weight: 0.8-1.0
  Guidance Start:
0.0
  Guidance End: 1.0
  
ControlNet Unit 1
  Model:
control_v11f1p_sd15_depth
  Preprocessor:
depth_midas
Weight: 0.4-0.6
InstantID Weight:
0.8
IdentityNet Scale:
0.5-0.8
Preserve Face
Details: Enabled
add_detail.safetensors (Weight: 0.4-0.6)
epi_noiseoffset2.safetensors (Weight: 0.3-0.5)
cinematic_lighting.safetensors (Weight: 0.5)
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
