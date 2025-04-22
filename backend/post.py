import os
import json

# Thay token của bạn ở đây
token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsInVzZXJuYW1lIjoidnVnaWF1Iiwicm9sZXMiOm51bGwsImlhdCI6MTc0NTMyMzg5NiwiZXhwIjoxNzQ1MzI3NDk2fQ.Jm3oL3GIxdYKaVwO7T8I-GX49kFW4m7m6ztQVjMGGV4"

posts = [
    {
        "title": "Câu điều kiện loại 1 – Nếu thì dễ!",
        "description": "If + S + V (hiện tại), S + will + V",
        "steps": [
            "Dùng để nói về điều kiện có thể xảy ra trong hiện tại hoặc tương lai",
            "If it rains, I will stay at home.",
            "If you study hard, you will pass the exam."
        ],
        "mainImage": "https://tienganhnghenoi.vn/wp-content/uploads/2023/04/cau-truc-if-loai-1.jpg"
    },
    {
        "title": "Câu bị động – Passive Voice",
        "description": "S + be + V3/ed (by + O)",
        "steps": [
            "Chủ ngữ bị tác động bởi hành động",
            "The homework is done by Tom.",
            "English is spoken all over the world."
        ],
        "mainImage": "https://talkfirst.vn/wp-content/uploads/2024/06/cong-thuc-cau-bi-dong.jpg"
    },
    {
        "title": "Cấu trúc So, Such, Too",
        "description": "So - Such - Too dùng để nhấn mạnh",
        "steps": [
            "such + (a/an) + adj + noun + that + S + V",
            "S + to be + too + adj + (for sb) + to + V",
            "S + V + too + adv + (for sb) + to + V"
        ],
        "mainImage": "https://npedu.vn/wp-content/uploads/2023/12/Intensifiers-so-such-too-enough.png"
    },
    {
        "title": "Thì hiện tại đơn – Present Simple",
        "description": "Dùng cho thói quen, sự thật, lịch trình",
        "steps": [
            "S + V (s/es) + O",
            "I go to school every day.",
            "The sun rises in the east."
        ],
        "mainImage": "https://st.mshoajunior.edu.vn/src/mshoajunior-image/2023/05/24/b65cbd3f-60a1-40a0-ab86-4891eb157ecc.jpg"
    },
    {
        "title": "Thì hiện tại tiếp diễn – Present Continuous",
        "description": "Dùng cho hành động đang xảy ra tại thời điểm nói",
        "steps": [
            "S + am/is/are + V-ing",
            "She is studying English now.",
            "They are playing football."
        ],
        "mainImage": "https://bmyc.vn/wp-content/uploads/2023/12/Thi-hien-tai-tiep-dien_2.jpg"
    },
    {
        "title": "Câu gián tiếp – Reported Speech",
        "description": "Tường thuật lại lời nói của người khác",
        "steps": [
            "He said (that) he was tired.",
            "She asked me where I lived.",
            "I told him I would help him."
        ],
        "mainImage": "https://thanhtay.edu.vn/wp-content/uploads/2021/07/quy-tac-chuyen-doi-tu-cau-truc-tiep-sang-cau-gian-tiep-e1626254788627.jpg"
    },
    {
        "title": "So sánh hơn và nhất – Comparatives & Superlatives",
        "description": "Dùng để so sánh hai hay nhiều đối tượng",
        "steps": [
            "Comparative: adj + er / more + adj + than",
            "Superlative: the + adj + est / most + adj",
            "Tom is taller than Jerry. | He is the smartest student."
        ],
        "mainImage": "https://media.zim.vn/6594c4ab4e3e1d6e12e99bbb/so-sanh-nhat.jpg"
    },
    {
        "title": "Động từ khuyết thiếu – Modal Verbs",
        "description": "Can, Could, May, Might, Should, Must, Will, Would...",
        "steps": [
            "S + modal verb + V (bare infinitive)",
            "You should study harder.",
            "I can swim. / He must be tired."
        ],
        "mainImage": "https://acet.edu.vn/wp-content/uploads/2021/08/dong-tu-khuyet-thieu-modal-verbs-la-gi.jpg"
    }
]

for post in posts:
    data_json = json.dumps(post).replace("'", "\\'")
    command = f"""
curl -X 'POST' \\
  'https://engnet.onrender.com/posts' \\
  -H 'accept: */*' \\
  -H 'Authorization: {token}' \\
  -H 'Content-Type: application/json' \\
  -d '{data_json}'
"""
    print(">> Gửi bài:", post["title"])
    os.system(command)
