# Dual-Spark live dashboard with RDMA cable monitoring

By @abheer
Language: ? · Domains: product, data · Source: V04

Original post: https://x.com/abheer/status/2104048128022503473

Source page: https://data.openchamber.dev/opus-5-5-videos/v/abheer-2104048128022503473

Demo video: https://video.twimg.com/amplify_video/2104048114500071424/vid/avc1/1440x810/I3s5Q7cqqo8t2wK6.mp4?tag=29

```
Build a live dashboard for two DGX Sparks linked by QSFP. Python stdlib agent on each Spark. The head agent serves one HTML page and pulls the worker’s stats over the cable. Bind the head to localhost, the worker to its cable IP. Show GPU util, temp, power, unified memory from /proc/meminfo, CPU, disk, and model tok/s from vLLM /metrics or llama.cpp /slots (n_decoded is nested under next_token). Center panel is the cable: read CX7 RDMA counters with ethtool -S rx/tx_vport_rdma_unicast_bytes, show GB/s each way and % RDMA as two animated copper lanes. Graphite theme, gold accents, big numbers, sparklines, one-word status per Spark, minimal text. Use your own cable IPs and interface.
```

Creator's prompt, collected for private study. Ask before republishing.
