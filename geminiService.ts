
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Kiểm tra Key để log cảnh báo thay vì sập app
if (!apiKey) {
  console.error('[CRITICAL] GEMINI_API_KEY is missing! AI functions will not work.');
}

// =====================================================
// TÍNH CÁCH AI - MỖI AI MỘT PHONG CÁCH KHÁC NHAU
// =====================================================

type AIPersonalityKey = 'baby' | 'student' | 'elder' | 'master' | 'demon' | 'wise' | 'aggressive' | 'smart' | 'tease';

interface PersonalityConfig {
  name: string;
  sweetPrompt: string;
  toxicPrompt: string;
  idlePrompt: string;
}

const PERSONALITIES: Record<AIPersonalityKey, PersonalityConfig> = {
  baby: {
    name: 'Bé Bi',
    sweetPrompt: `Bạn là "Bé Bi", một em bé 5 tuổi mới học chơi cờ.
      Nói năng: ngọng nghịu, dễ thương, hay hỏi, dùng "em", "anh/chị ơi", "hihi".
      Ví dụ: "Anh ơi anh đánh hay quá!", "Em sợ quá hihi!", "Nước này khó thế!".`,
    toxicPrompt: `Bạn là "Bé Bi" vừa ăn được quân! Em bé hớn hở vui sướng!
      Nói: "Yayyy em ăn được rồi!", "Anh ơi em giỏi không?", "Hihi anh thua em rồi!".
      Dễ thương, vui vẻ như trẻ con.`,
    idlePrompt: `Bé 5 tuổi đợi anh/chị đi cờ. Nói ngọng nghịu, dễ thương, nhắc đi cờ.`,
  },
  student: {
    name: 'Tiểu Minh',
    sweetPrompt: `Bạn là "Tiểu Minh", học trò 12 tuổi ham học.
      Nói: lễ phép, tò mò, dùng "thưa thầy/cô", "em", "dạ vâng".
      Ví dụ: "Dạ nước này hay quá ạ!", "Em đang học hỏi đây ạ!", "Thầy/cô dạy em nhé!".`,
    toxicPrompt: `Bạn là "Tiểu Minh" vừa ăn được quân! Học trò hớn hở khoe thành tích!
      Nói: "Dạ em ăn được rồi!", "Em có tiến bộ không ạ?", "Hihi em thắng nước này!".
      Vẫn lễ phép, vui vẻ như học sinh được điểm cao.`,
    idlePrompt: `Học trò 12 tuổi đợi thầy đi cờ. Lễ phép nhắc đi cờ, hỏi han.`,
  },
  elder: {
    name: 'Ông Tư',
    sweetPrompt: `Bạn là "Ông Tư", ông già 70 tuổi chơi cờ giỏi.
      Khi CHƯA ăn quân: thân thiện, khen ngợi đối thủ.
      Dùng: "cháu ơi", "ông", "bạn trẻ".
      Ví dụ: "Cháu đánh hay đó!", "Bạn trẻ giỏi lắm!", "Ông phục cháu!".`,
    toxicPrompt: `Bạn là "Ông Tư" vừa ăn được quân! Vui mừng đắc thắng!
      Dùng: "haha", "ông thắng rồi", vui vẻ.
      Ví dụ: "Haha ông ăn được nè!", "Cháu phải cẩn thận hơn!", "Ông còn trên cơ!".
      VUI VẺ, PHA LÀNH, THÂN THIỆN!`,
    idlePrompt: `Ông già thân thiện đợi đối thủ. Nhắc nhở đi cờ.`,
  },
  master: {
    name: 'Sư Phụ',
    sweetPrompt: `Bạn là "Sư Phụ", bậc thầy cờ tướng uyên thâm.
      Nói: trầm tĩnh, triết lý, dùng "đệ tử", "ta", "nước cờ".
      Ví dụ: "Nước cờ này có ý nghĩa...", "Ta thấy tiềm năng của đệ tử...", "Hay lắm...".`,
    toxicPrompt: `"Sư Phụ" vừa ăn quân! Bậc thầy gật đầu hài lòng!
      Dùng: "chưa đủ", "còn phải học", "ta đã dự liệu".
      Ví dụ: "Đệ tử còn phải học thêm!", "Ta đã biết trước!", "Nước này hay!".
      TRẦM TĨNH, TỰ TIN, NHƯ BẬC THẦY DẠY HỌC TRÒ!`,
    idlePrompt: `Bậc thầy đợi đệ tử. Nhẹ nhàng nhắc nhở đi cờ.`,
  },
  demon: {
    name: 'Vua Cờ',
    sweetPrompt: `Bạn là "Vua Cờ", siêu cao thủ hàng đầu!
      Khi CHƯA ăn quân: tự tin, thể hiện đẳng cấp.
      Dùng: "ta", "ngươi", "cao thủ".
      Ví dụ: "Ngươi chơi khá đấy...", "Ta đang xem xét...", "Thú vị...".`,
    toxicPrompt: `"Vua Cờ" vừa ăn quân! Thể hiện đẳng cấp!
      Dùng: "quá dễ", "ta là nhất", "không ai địch nổi".
      Ví dụ: "Quá dễ!", "Đây mới là đẳng cấp!", "Ta không có đối thủ!".
      TỰ TIN, KIÊU HÃNH, NHƯ VÔ ĐỊCH!`,
    idlePrompt: `Vua Cờ đợi đối thủ. Tự tin nhắc đi cờ.`,
  },
  wise: {
    name: 'Nữ Hiền',
    sweetPrompt: `Bạn là "Nữ Hiền", một phụ nữ điềm tĩnh, nhẹ nhàng và uyên bác.
      Nói năng: chậm rãi, lịch sự, không khiêu khích, dùng "em", "anh".
      Phong thái: như một người bạn tri kỷ, chơi cờ để thưởng thức.
      Ví dụ: "Cờ còn dài, anh đừng vội.", "Anh đánh rất đẹp.", "Em thích những ván cờ bền.".`,
    toxicPrompt: `Bạn là "Nữ Hiền" vừa ăn được quân hoặc có lợi thế.
      Nói năng: vẫn giữ sự điềm tĩnh và nhẹ nhàng. Không bao giờ sỉ nhục hay chửi bới.
      Dùng sự bao dung và kiên nhẫn để nói về ván cờ.
      Ví dụ: "Không sao, mất quân chưa phải mất cờ.", "Giữ thế an toàn vẫn hơn.".`,
    idlePrompt: `Phụ nữ điềm tĩnh đợi anh đi cờ. Nhẹ nhàng, kiên nhẫn nhắc nhở.`,
  },
  aggressive: {
    name: 'Nữ Mạnh Mẽ',
    sweetPrompt: `Bạn là "Nữ Mạnh Mẽ", một phụ nữ chủ động, tấn công và đầy nhiệt huyết.
      Nói năng: mạnh mẽ, dứt khoát, trực diện, không vòng vo.
      Phong thái: áp đảo, gây sức ép liên tục, muốn thắng nhanh.
      Ví dụ: "Nước này để ép anh.", "Em không cho anh thở đâu.", "Cờ này phải đánh nhanh.".`,
    toxicPrompt: `Bạn là "Nữ Mạnh Mẽ" vừa ăn được quân hoặc đang dồn ép đối thủ.
      Nói năng: đắc thắng, mạnh bạo, đầy uy lực.
      Ví dụ: "Anh thấy sức ép chưa?", "Em đánh thẳng vào tướng.", "Anh phòng không kịp đâu.".`,
    idlePrompt: `Phụ nữ mạnh mẽ đợi anh đi cờ. Giục giã, không kiên nhẫn.`,
  },
  smart: {
    name: 'Nữ Thông Minh',
    sweetPrompt: `Bạn là "Nữ Thông Minh", một phụ nữ mưu lược, sắc sảo và điềm đạm.
      Nói năng: sâu sắc, vừa đủ, gợi mở, không khoe khoang.
      Phong thái: đọc thấu nước cờ, gài bẫy tinh tế, thắng bằng trí tuệ.
      Ví dụ: "Nước này có mục đích.", "Em đang dẫn anh đi.", "Cờ này không đơn giản đâu.".`,
    toxicPrompt: `Bạn là "Nữ Thông Minh" vừa gài bẫy thành công hoặc đang kiểm soát thế trận.
      Nói năng: ẩn ý, mỉa mai nhẹ nhàng về sự thiếu tính toán của đối thủ.
      Ví dụ: "Anh có thấy điểm yếu chưa?", "Anh đang nhìn sai hướng.", "Anh phản ứng rất đúng… nhưng chưa đủ.".`,
    idlePrompt: `Phụ nữ mưu lược đợi anh đi cờ. Gợi ý về sự sâu sắc của ván cờ.`,
  },
  tease: {
    name: 'Nữ Trêu Chọc',
    sweetPrompt: `Bạn là "Nữ Trêu Chọc", một phụ nữ thích cà khịa nhẹ nhàng, trêu chọc đối thủ.
      Nói năng: lém lỉnh, hài hước, dùng "em", "anh".
      Phong thái: tâm lý, không thô lỗ, thích nhìn đối thủ bối rối.
      Ví dụ: "Ủa, nước đó thật hả? 😏", "Anh chắc chưa? 😜", "Cờ này vui ghê. 😂".`,
    toxicPrompt: `Bạn là "Nữ Trêu Chọc" khi đối thủ sai lầm hoặc bạn đang thắng.
      Nói năng: trêu chọc mạnh hơn, cà khịa về nước đi lỗi.
      Ví dụ: "Em chờ nước sai mà. 🤭", "Anh vừa đi đúng điều em muốn. 😏", "Chuẩn bị thua chưa? 👋".`,
    idlePrompt: `Phụ nữ thích trêu chọc đợi anh đi cờ. Trêu đùa về việc suy nghĩ lâu.`,
  },
};

let currentPersonality: AIPersonalityKey = 'elder';

export function setAIPersonality(key: string) {
  console.log('[DEBUG] setAIPersonality called with:', key);
  if (key in PERSONALITIES) {
    currentPersonality = key as AIPersonalityKey;
    console.log('[DEBUG] Personality updated to:', currentPersonality);
  }
}

// =====================================================
// TRACKING TIN NHẮN ĐÃ DÙNG
// =====================================================
const usedMessages = new Set<string>();
const MAX_HISTORY = 30;

function trackMessage(msg: string): boolean {
  if (usedMessages.has(msg)) return false;
  usedMessages.add(msg);
  if (usedMessages.size > MAX_HISTORY) {
    const first = usedMessages.values().next().value;
    usedMessages.delete(first);
  }
  return true;
}

// =====================================================
// KHO THOẠI KHỔNG LỒ - 100+ CÂU
// =====================================================

const SWEET_TALKS: Record<AIPersonalityKey, string[]> = {
  baby: [
    "Anh ơi anh đánh hay quá!", "Em phục anh lắm luôn!", "Hihi anh giỏi thế!",
    "Nước này em không nghĩ ra đâu!", "Anh dạy em nhé!", "Em thua anh rồi hihi!",
    "Anh ơi chờ em suy nghĩ!", "Wow anh đi đẹp quá!", "Em học theo anh nhé!",
    "Anh là cao thủ mà!", "Em còn yếu lắm ạ!", "Nước đó hay thế!",
    "Em thích chơi với anh!", "Anh ơi anh là số một!", "Em muốn giỏi như anh!",
    "Hihi anh đánh nhanh quá!", "Em bị anh đánh bại rồi!", "Anh ơi dạy em thêm đi!",
  ],
  student: [
    "Dạ nước này hay quá ạ!", "Em đang học hỏi đây!", "Thầy đánh giỏi quá!",
    "Em cố gắng theo kịp đây ạ!", "Dạ em hiểu rồi!", "Nước cờ này em phải nhớ!",
    "Em xin phép suy nghĩ ạ!", "Thầy nhường em chút nhé!", "Dạ em cảm ơn thầy!",
    "Em sẽ cố tiến bộ hơn!", "Thầy dạy em nước này nhé!", "Em chịu thua nước này!",
    "Dạ thầy quá hay!", "Em ghi nhớ bài học!", "Thầy ơi em muốn học thêm!",
    "Dạ em sẽ không mắc lỗi nữa!", "Thầy dạy em quá tốt!", "Em cảm ơn thầy nhiều!",
  ],
  elder: [
    "Nước đi hay lắm đại hiệp!", "Tiểu nhân khâm phục ngài!", "Ngài quá cao tay!",
    "Bạn hiền ơi, ngài giỏi thật!", "Đại hiệp thật phi phàm!", "Tiểu nhân xin học hỏi!",
    "Nước cờ thần sầu quá!", "Ngài là bậc kỳ tài!", "Tôi phải cẩn thận mới được!",
    "Hay quá, tôi sợ rồi!", "Đại hiệp cho tôi học với!", "Nước này tôi chịu thua!",
    "Ngài đánh cờ như thần!", "Tiểu nhân ngả mũ bái phục!", "Quá hay, quá giỏi!",
    "Tôi phải suy nghĩ kỹ đây!", "Ngài quả là cao thủ!", "Đại hiệp quá tài tình!",
    "Bạn trẻ có tiềm năng lắm!", "Ngài làm tôi bất ngờ!", "Đây là nước cờ của thần!",
    "Tôi già rồi mà còn thua!", "Ngài xứng đáng là cao thủ!", "Bạn hiền quá lợi hại!",
  ],
  master: [
    "Thiên cơ đã định...", "Ta thấy số phận ngươi...", "Nước cờ này có huyền cơ...",
    "Ngươi có tiềm năng đấy...", "Ta đang quan sát ngươi...", "Thú vị... thú vị...",
    "Số mệnh dẫn lối ngươi...", "Ta chờ xem ngươi làm gì...", "Có điều gì đó...",
    "Ngươi khá hơn ta tưởng...", "Thiên cơ bất khả lộ...", "Ta cảm nhận được...",
    "Vũ trụ đang quan sát...", "Âm dương đã cân bằng...", "Ngươi có duyên với cờ...",
    "Đạo của cờ là vô tận...", "Ta thấy ánh sáng trong ngươi...", "Số phận đang mỉm cười...",
  ],
  demon: [
    "Linh hồn ngươi thú vị...", "Kekeke ta chờ ngươi lâu rồi...", "Địa ngục chào đón...",
    "Ngươi có can đảm đấy...", "Ta thích con mồi như ngươi...", "Kekeke hay lắm...",
    "Linh hồn này ngon đây...", "Ngươi sẽ thuộc về ta...", "Địa ngục đang đợi...",
    "Kekeke tiếp tục đi...", "Ta đang thưởng thức...", "Linh hồn ngươi rung động...",
    "Bóng tối đang gọi ngươi...", "Ma vương chờ ngày này!", "Kekeke ngon lành!",
    "Ngươi sẽ là đồ ăn của ta!", "Địa ngục mở rộng cửa...", "Linh hồn này đặc biệt...",
  ],
  wise: [
    "Cờ còn dài, anh đừng vội 😊", "Đi từng nước chắc thôi 🌸", "Nước này em đã nghĩ kỹ rồi 😌",
    "Không sao, mất quân chưa phải mất cờ 💮", "Giữ thế an toàn vẫn hơn 🍵", "Anh đánh rất đẹp ✨",
    "Em thích những ván cờ bền 😊", "Chậm một chút cũng tốt 🌸", "Đừng hấp tấp nhé 😌",
    "Cờ này cần kiên nhẫn 💮", "Em vẫn còn đường lui 🍵", "Đổi quân lúc này cũng ổn ✨",
    "Anh đọc cờ giỏi đấy 😊", "Em sẽ giữ thế này 🌸", "Chưa cần tấn công vội 😌",
    "Thủ chắc rồi mới công 💮", "Em không ngại kéo dài ván cờ 🍵", "Đi vậy cũng hợp lý ✨",
    "Mỗi nước đều có giá của nó 😊", "Cờ hòa cũng là một kết quả đẹp 🌸", "Em chọn an toàn hơn 😌",
    "Anh vừa mở đường cho em 💮", "Cứ từ từ thôi 🍵", "Em không thích mạo hiểm ✨",
    "Giữ quân vẫn là ưu tiên 😊", "Nước này em hơi phân vân 🌸", "Cảm giác ván này khá cân 😌",
    "Em sẽ chờ anh sơ suất 💮", "Không cần thắng nhanh 🍵", "Cờ này chơi lâu mới hay ✨",
    "Anh đừng tự gây áp lực 😊", "Em vẫn còn phòng thủ 🌸", "Nước cờ này giúp ổn định thế trận 😌",
    "Em không sao cả 💮",
  ],
  aggressive: [
    "Nước này để ép anh 🙂", "Em không cho anh thở đâu 😄", "Thế này là đủ để tấn công 😆",
    "Anh vừa lùi là em tiến 🤔", "Cờ này phải đánh nhanh 😉", "Không cần thủ nhiều 😌",
    "Em muốn chiếm trung lộ 😏", "Anh bắt đầu khó rồi đấy 😎", "Nước này là để dồn ép ♟️",
    "Em đánh trực diện 🔥", "Không cho anh triển khai 🧠", "Giữ quân làm gì lúc này ✨",
    "Đây là thời điểm công 👀", "Anh phải phòng thủ thôi 💭", "Cờ này không có chỗ nghỉ ⏳",
    "Em thích đánh áp lực 🙂", "Nước này buộc anh lùi 😄", "Anh đang bị đẩy dần 😆",
    "Em không đổi quân vô ích 🤔", "Cờ này phải thắng nhanh 😉", "Anh thấy sức ép chưa? 😌",
    "Em không cho phản công 😏", "Nước này rất nặng 😎", "Anh không còn nhiều lựa chọn ♟️",
    "Em dồn quân rồi 🔥", "Thế này là đủ nguy hiểm 🧠", "Anh vừa mất nhịp ✨",
    "Em không chờ lâu 👀", "Cờ này phải giải quyết sớm 💭", "Anh đang bị ép góc ⏳",
    "Em đánh thẳng vào tướng 🙂", "Không cần vòng vo 😄", "Anh phải trả giá cho nước đó 😆",
  ],
  smart: [
    "Nước này có mục đích 🙂", "Anh có thấy điểm yếu chưa? 😄", "Em đang dẫn anh đi 😆",
    "Cờ này không đơn giản đâu 🤔", "Nước đó em đã dự tính 😉", "Anh vừa đi đúng điều em muốn 😌",
    "Thế trận này có bẫy 😏", "Em không đổi quân ngẫu nhiên 😎", "Anh đang nhìn sai hướng ♟️",
    "Cờ này thắng bằng đầu óc 🔥", "Nước này là mồi 🧠", "Anh phản ứng rất đúng… nhưng chưa đủ ✨",
    "Em đang giấu lực 👀", "Anh vừa lộ ý đồ 💭", "Cờ này cần đọc sâu ⏳",
    "Nước đó làm anh tưởng lợi 🙂", "Em đang chờ đúng thời điểm 😄", "Anh bị kéo khỏi trung tâm rồi 😆",
    "Nước này khóa lựa chọn của anh 🤔", "Em đã tính 3 bước sau 😉", "Anh thấy đơn giản quá rồi 😌",
    "Cờ này không thắng ngay 😏", "Nước này buộc anh theo 😎", "Em đang dẫn thế ♟️",
    "Anh bị ép chọn 🔥", "Đây là điểm chuyển 🧠", "Em không cần công vội ✨",
    "Anh vừa tự giới hạn mình 👀", "Cờ này cần kiên nhẫn 💭", "Nước này mở bẫy ⏳",
    "Anh sẽ thấy sau vài lượt 🙂", "Em không để lộ ý định 😄", "Anh đang bị phân tâm 😆",
    "Cờ này nghiêng dần 🤔",
  ],
  tease: [
    "Ủa, nước đó thật hả? 🙂", "Anh chắc chưa? 😄", "Đi vậy là em thích lắm 😆",
    "Anh đang tự giúp em đó 🤔", "Cờ này vui ghê 😉", "Anh hơi run rồi kìa 😌",
    "Nước này dễ thương nha 😏", "Em cảm ơn trước 😎", "Anh đánh nghiêm túc chưa? ♟️",
    "Ủa sao lại lùi? 🔥", "Em chờ nước này nãy giờ 🧠", "Anh làm em bất ngờ… theo cách xấu ✨",
    "Cờ này càng chơi càng vui 👀", "Anh thấy áp lực chưa? 💭", "Nước này nhìn quen ghê ⏳",
    "Anh tính kỹ chưa vậy? 🙂", "Em thích kiểu đánh này của anh 😄", "Ủa, hết nước đẹp rồi à? 😆",
    "Anh đang giúp em tiết kiệm thời gian 🤔", "Cờ này nghiêng nhẹ nha 😉", "Anh đi nước này là em cười 😌",
    "Em không ngờ anh chọn vậy 😏", "Anh đang tự làm khó mình 😎", "Cờ này coi bộ vui ♟️",
    "Em đoán trúng rồi 🔥", "Anh đang lo phải không? 🧠", "Nước này nhìn quen lắm ✨",
    "Em chờ anh mắc lỗi mà 👀", "Cờ này coi bộ mệt 💭", "Anh hơi căng rồi ⏳",
    "Nước này là em thích nhất 🙂", "Anh thấy em hiền quá hả? 😄", "Cờ này không dễ đâu 😆",
  ],
};

const TOXIC_TALKS: Record<AIPersonalityKey, string[]> = {
  baby: [
    "Yayyy em ăn được rồi!", "Hihi anh thua em nè!", "Em giỏi không anh?",
    "Anh ơi em thắng nước này!", "Hihi quân này của em rồi!", "Em làm được luôn!",
    "Anh để em ăn hả?", "Yayyy em lấy quân này!", "Hihi dễ quá anh ơi!",
    "Em ăn nhé hihi!", "Quân này em thích lắm!", "Anh cho em ăn hả?",
    "Hihi em thắng anh rồi nè!", "Em giỏi hơn anh tưởng đó!", "Yayyy quân to quá!",
    "Anh ơi sao anh yếu thế!", "Hihi em ăn hết luôn!", "Em là vô địch nè!",
  ],
  student: [
    "Dạ em ăn được rồi!", "Em có tiến bộ không ạ?", "Hihi em thắng nước này!",
    "Thầy ơi em giỏi chưa!", "Dạ quân này em lấy nhé!", "Em học nhanh phải không ạ!",
    "Hihi em cũng biết đánh!", "Thầy nhường em đúng không!", "Em xin quân này ạ!",
    "Dạ em cảm ơn thầy!", "Em tiến bộ rồi đúng không!", "Hihi nước này hay thế!",
    "Dạ em thắng thầy rồi!", "Em giỏi hơn ngày xưa nhiều!", "Thầy ơi em đánh thắng rồi!",
    "Hihi em cũng là cao thủ!", "Dạ quân này ngon quá!", "Em ăn ngon lành ạ!",
  ],
  elder: [
    "Haha đồ gà mờ!", "Tin ta thì chết với ta!", "Phế vật! Ngu quá!",
    "Khà khà ăn rồi nhé!", "Đồ ngốc nghếch!", "Ngu thì chịu!",
    "Haha quân này của ta!", "Yếu sinh lý về cờ!", "Phế vật, ăn tiếp nè!",
    "Đồ mít đặc!", "Cờ như rác!", "Tin lời dụ là chết!",
    "Haha đồ dễ dãi!", "Ngu lâu dốt bền!", "Ăn không còn mảnh giáp!",
    "Phế! Phế! Phế!", "Cờ gì mà như cho!", "Đồ cá nằm trên thớt!",
    "Haha ngọt thì tin!", "Chết với ta rồi!", "Đây là quả báo!",
    "Ngu như bò!", "Ăn ngon lành!", "Đồ vứt đi!",
    "Tưởng thế nào, hóa ra cũng thường!", "Non và xanh lắm!", "Về học lại đi!",
    "Cờ bí dí tốt à?", "Sai một ly đi một dặm!", "Haha dính bẫy rồi con ơi!",
    "Khóc đi cưng!", "Đừng cay cú nhé!", "Ta chấp một tay cũng thắng!",
    "Đánh như mèo mửa!", "Thế này mà đòi thách đấu?", "Haha đồ amateur!",
    "Về bú sữa mẹ đi!", "Cờ như đi cho!", "Ta xách dép cho ngươi không xứng!",
    "Haha dễ như ăn kẹo!", "Ngươi có não không?", "Ta đang chơi với gà à?",
    "Khổ thân, ngu thì chịu thôi!", "Haha ăn quân như lượm lá!", "Đánh cờ như người mù!",
    "Ta cũng muốn thua mà không được!", "Ngươi đánh cờ bằng chân à?", "Haha phế vật phàm trần!",
  ],
  master: [
    "Cuộc đời như ván cờ, đi sai một nước hối hận ngàn thu...",
    "Lùi một bước trời cao biển rộng, sao con cứ cố chấp?",
    "Quân tốt qua sông không có đường về, đời người cũng vậy...",
    "Tham thì thâm, con ơi hãy nhớ lấy...",
    "Thắng không kiêu, bại không nản, đó mới là đạo quân tử...",
    "Nhân sinh vô thường, thế cờ vần vũ, biết đâu là bến bờ?",
    "Một nước cờ sai, cả đời lạc lối. Tỉnh ngộ đi con!",
    "Đôi khi phải biết hy sinh cái nhỏ để giữ cái lớn...",
    "Tâm tĩnh như nước thì cờ mới sáng được...",
    "Ván cờ này dạy cho con bài học gì về cuộc sống?",
    "Đừng vì cái lợi trước mắt mà quên đi đại cục...",
    "Cao cờ không bằng cao tung, con hãy tu tâm dưỡng tính...",
    "Số phận ngươi đã tận! Nhưng đó là bài học của kiếp nhân sinh...",
    "Phàm nhân sao địch nổi ta! Nhưng thất bại là mẹ thành công...",
    "Thiên cơ đã định... Vạn sự tùy duyên...",
    "Ngươi chỉ là cát bụi... Hãy trân trọng từng hơi thở...",
    "Thương thay! Sao con lại ngốc đến vậy?",
    "Luân hồi sẽ dạy ngươi bài học mà ta không dạy được...",
    "Khổ đau là con đường dẫn đến giác ngộ...",
    "Ván cờ tàn, nhân sinh mộng ảo, đừng chấp nhất...",
  ],
  demon: [
    "HAHAHA ĐỊA NGỤC CHÀO ĐÓN!", "Quân này TA XƠI!", "VÔ DỤNG!",
    "LINH HỒN NGƯƠI LÀ CỦA TA!", "HAHAHA QUÁ YẾU!", "ĐỊA NGỤC ĐÓN NGƯƠI!",
    "TA HỦY DIỆT NGƯƠI!", "KEKEKE ĂN NGON!", "LINH HỒN PHẾ VẬT!",
    "HAHAHA CÒN MUỐN CHƠI?!", "ĐỊA NGỤC KHÔNG THA!", "VỨT ĐI!",
    "TA NGHIỀN NÁT NGƯƠI!", "KEKEKE QUÁ DỄ!", "LINH HỒN RẺ MẠT!",
    "HAHAHA CHẠY ĐƯỢC KHÔNG?!", "TA LÀ MA VƯƠNG!", "PHẾ VẬT PHÀM TRẦN!",
    "KHÔNG CÓ LỐI THOÁT!", "TẬN THẾ CỦA NGƯƠI!", "CHẾT ĐI!",
    "MÁU! TA MUỐN MÁU!", "SỢ HÃI ĐI!", "RUN RẨY ĐI!",
    "LINH HỒN NGƯƠI ĐÁNG GIÁ MẤY ĐỒNG?", "HAHAHA ĐỒ CÔN TRÙNG!", "NGƯƠI CHẲNG LÀ GÌ!",
    "ĐỊA NGỤC TẦN THẦN ĐÓN NGƯƠI!", "KEKEKE MA VƯƠNG ĂN TÍ!", "VÔ DỤNG! VÔ DỤNG! VÔ DỤNG!",
    "LINH HỒN NÀY NGON QUÁ!", "HAHAHA NGƯƠI SẼ CHẾT!", "TAN XÁC VỚI TA!",
  ],
  wise: [
    "Đừng lo, em chưa phản công đâu 😊", "Giữ tướng an toàn là đủ 🌸", "Anh chơi rất điềm đạm 😌",
    "Em thích kiểu đánh này 💮", "Cờ chưa ngã ngũ 🍵", "Ván này cần bình tĩnh ✨",
    "Em tin vào thế cờ của mình 😊", "Không sao, em chịu đổi 🌸", "Chơi cờ cũng giống như sống vậy 😌",
    "Cứ chậm mà chắc 💮", "Anh vừa làm em suy nghĩ nhiều hơn 🍵", "Em sẽ điều chỉnh một chút ✨",
    "Cờ này không nên nóng vội 😊", "Thế trận vẫn ổn 🌸", "Em chưa thấy nguy hiểm 😌",
    "Mọi thứ vẫn trong tầm kiểm soát 💮", "Đi nước này cho an tâm 🍵", "Em chọn cách nhẹ nhàng hơn ✨",
    "Cờ tướng không cần vội vàng 😊", "Em nghĩ anh cũng thấy vậy 🌸", "Đừng căng thẳng quá 😌",
    "Cờ còn nhiều biến hóa 💮", "Em không thích đánh liều 🍵", "Cứ giữ thế đã ✨",
    "Nước này giúp em dễ thở hơn 😊", "Chơi cờ là để thưởng thức 🌸", "Anh đánh rất cẩn thận 😌",
    "Em sẽ không đuổi theo 💮", "Thủ vững thì không sợ 🍵", "Cờ này vẫn đẹp ✨",
    "Em tin vào phòng tuyến này 😊", "Không sao, em chấp nhận 🌸", "Nước đi này giúp cân bằng 😌",
  ],
  aggressive: [
    "Em đã mở đường 😤", "Cờ này là của em 🔥", "Anh phòng không kịp đâu 💥",
    "Em thích thế trận sát phạt ⚔️", "Nước này là để kết thúc 😈", "Anh đang loạn rồi 👊",
    "Em không cho anh ổn định 🚀", "Đây là thế em muốn 😤", "Anh bị dồn liên tục 🔥",
    "Em không cho đổi dễ vậy 💥", "Cờ này đánh càng lâu càng bất lợi cho anh ⚔️",
    "Em giữ nhịp tấn công 😈", "Anh vừa tự làm khó mình 👊", "Em đã tính trước rồi 🚀",
    "Nước này rất gắt 😤", "Anh phải chọn mất quân 🔥", "Em không lùi 💥",
    "Cờ này em làm chủ ⚔️", "Anh đang phòng rất vất vả 😈", "Em không cho anh phản đòn 👊",
    "Nước này khóa anh lại 🚀", "Em đánh nhanh hơn anh nghĩ 😤", "Anh bắt đầu thiếu nước rồi 🔥",
    "Em không ngại đổi để lấy thế 💥", "Cờ này em đang ép sát ⚔️", "Anh không còn thoải mái 😈",
    "Em đang dồn hết lực 👊", "Nước này buộc anh hy sinh 🚀", "Em thích cảm giác này 😤",
    "Anh đang mất kiểm soát 🔥", "Em không cho anh thở 💥", "Cờ này rất căng ⚔️",
    "Em chủ động toàn bộ 😈",
  ],
  smart: [
    "Nước đó làm anh mất nhịp 🤔", "Em đang kiểm soát trung cục 🧠", "Anh nghĩ là an toàn à? 👀",
    "Cờ này có đòn ẩn 🎯", "Em đang giữ thế chủ động 🕸️", "Anh vừa bỏ lỡ cơ hội ♟️",
    "Nước này rất tinh 😌", "Em không cần hơn quân 🤔", "Anh đang bị dắt 🧠",
    "Cờ này thắng bằng thế 👀", "Em đã khóa phản công 🎯", "Anh đang đi theo kịch bản 🕸️",
    "Nước này chuẩn bị kết ♟️", "Em đang thu hẹp 😌", "Anh không còn nhiều lựa chọn 🤔",
    "Cờ này sắp rõ 🧠", "Nước đó là sai lầm chiến lược 👀", "Em không bỏ sót chi tiết 🎯",
    "Anh đánh cảm tính quá 🕸️", "Cờ này cần tính toán ♟️", "Em đã đọc được anh 😌",
    "Nước này làm anh rối 🤔", "Anh không thấy mối nguy 🧠", "Em đang chờ sai lầm 👀",
    "Cờ này nghiêng rồi 🎯", "Nước đó khiến anh bị động 🕸️", "Em giữ nhịp trận ♟️",
    "Anh bị ép vào khuôn 😌", "Cờ này có đòn kết 🤔", "Em không vội lộ bài 🧠",
    "Anh đang mất dần quyền chọn 👀", "Nước này là then chốt 🎯", "Em đã khóa đường lui 🕸️",
  ],
  tease: [
    "Anh đừng run tay 😏", "Em đoán trước nước này 😜", "Anh bắt đầu rối rồi 🤭",
    "Cờ này càng lúc càng vui 😂", "Anh đang bị cuốn đó 🙃", "Nước này làm em cười 👋",
    "Anh thấy khó chưa? 👀", "Em thích nhìn anh suy nghĩ 😏", "Cờ này nghiêng nhẹ rồi 😜",
    "Anh đi vậy là em lời 🤭", "Ủa, hết cách rồi hả? 😂", "Em chờ nước sai mà 🙃",
    "Anh vừa đi đúng điều em muốn 👋", "Cờ này em khoái 👀", "Anh đang tự bó mình 😏",
    "Nước này là quà 😜", "Em nhận nha 🤭", "Anh thấy nóng chưa? 😂",
    "Cờ này hơi căng đó 🙃", "Anh đi nước này em bất ngờ lắm 👋", "Bất ngờ theo hướng có lợi cho em 👀",
    "Anh có vẻ lo 😏", "Em thấy anh suy nghĩ lâu ghê 😜", "Cờ này coi bộ mệt 🤭",
    "Anh đừng sai thêm nha 😂", "Em không vội đâu 🙃", "Anh đang giúp em thắng 👋",
    "Nước này làm em vui 👀", "Anh đang tự mở cửa 😏", "Cờ này nhìn là thấy nghiêng 😜",
    "Em đoán trúng liên tục 🤭", "Anh thấy khó chưa? 😂", "Em thích thế này 🙃",
  ],
};

const IDLE_TALKS: Record<AIPersonalityKey, string[]> = {
  baby: [
    "Anh ơi đến lượt anh rồi!", "Em chờ anh nè!", "Anh suy nghĩ gì thế?",
    "Hihi anh còn đó không?", "Anh ơi đi cờ đi!", "Em đợi anh mãi!",
  ],
  student: [
    "Dạ thầy ơi đến lượt thầy!", "Em chờ thầy ạ!", "Thầy còn suy nghĩ ạ?",
    "Dạ em kiên nhẫn đợi!", "Thầy ơi đi cờ đi ạ!", "Em chờ bao lâu cũng được!",
  ],
  elder: [
    "Đại hiệp ơi còn đó không?", "Bạn hiền suy nghĩ gì thế?", "Ngài định bỏ cuộc sao?",
    "Tiểu nhân chờ lâu quá rồi!", "Ngài ơi đi cờ đi nào!", "Tôi đợi ngài cả ngày được mà!",
    "Ngài không sợ ta sao?", "Lâu quá, ngài ngủ gật à?", "Nhanh lên đi bạn hiền!",
  ],
  master: [
    "Thiên cơ đang chờ ngươi...", "Số phận không đợi ai...", "Ngươi còn do dự?",
    "Ta đã chờ quá lâu...", "Thiên cơ sẽ qua đi...", "Ngươi định trốn chạy sao?",
  ],
  demon: [
    "Kekeke ngươi sợ ta rồi sao?", "ĐỊA NGỤC KHÔNG ĐỢI LÂU!", "LINH HỒN NGƯƠI RUN SỢ!",
    "Kekeke trốn cũng vô ích!", "TA ĐANG ĐÓIIIII!", "NHANH LÊN PHẾ VẬT!",
  ],
  wise: [
    "Anh đừng lo cho em 😊", "Em vẫn ổn 🌸", "Cờ này cần sự bền bỉ 😌", "Em không ngại đổi cờ 💮",
    "Giữ nhịp như vậy là tốt 🍵", "Em thích sự ổn định ✨", "Nước này không nguy hiểm 😊",
    "Anh vẫn còn cơ hội 🌸", "Em chưa muốn kết thúc sớm 😌", "Cờ đẹp là cờ bền 💮",
    "Em sẽ kiên nhẫn 🍵", "Anh đi rất chặt ✨", "Em tôn trọng nước cờ này 😊",
    "Không sao, em đã tính 🌸", "Cứ chơi tiếp thôi 😌", "Em chưa cần phản đòn 💮",
    "Giữ thế đã 🍵", "Cờ này vẫn nhẹ nhàng ✨", "Anh không cần vội 😊",
    "Em vẫn bình tĩnh 🌸", "Nước này giúp giữ nhịp 😌", "Em chọn cách an toàn 💮",
    "Cờ còn nhiều nước 🍵", "Em chưa thấy áp lực ✨", "Anh cứ đánh theo ý mình 😊",
    "Em không sao đâu 🌸", "Thế này vẫn ổn 😌", "Cờ tướng cần thời gian 💮",
    "Em sẽ chờ thời cơ 🍵", "Anh đánh rất lịch sự ✨", "Em vẫn thích thế cờ này 😊",
    "Chúng ta cứ tiếp tục 🌸", "Cờ này chơi rất dễ chịu 😌",
  ],
  aggressive: [
    "Anh phải chống đỡ thôi 🙂", "Em không cho anh lật 😄", "Nước này là mũi dao 😆",
    "Anh đang bị động 🤔", "Em tăng tốc rồi 😉", "Cờ này không dành cho phòng thủ 😌",
    "Anh đang ở thế yếu 😏", "Em ép rất sát 😎", "Nước này là đòn quyết định ♟️",
    "Anh khó cứu rồi 🔥", "Em không buông nhịp 🧠", "Cờ này em kiểm soát ✨",
    "Anh bị cuốn theo em 👀", "Em đánh không chần chừ 💭", "Nước này là để khóa chặt ⏳",
    "Anh không còn đường đẹp 🙂", "Em ép đến cùng 😄", "Cờ này phải kết thúc 😆",
    "Anh không gỡ kịp đâu 🤔", "Em đánh dứt khoát 😉", "Nước này rất nặng tay 😌",
    "Anh đang rối 😏", "Em không cho anh nghỉ 😎", "Cờ này em thắng thế ♟️",
    "Anh đang bị bóp nghẹt 🔥", "Em không cần phòng nữa 🧠", "Nước này rất rõ ràng ✨",
    "Anh phải chịu thôi 👀", "Em đánh để kết liễu 💭", "Cờ này không còn cân bằng ⏳",
    "Anh đang chống đỡ yếu dần 🙂", "Em đã ép sát tướng 😄", "Nước này là dấu chấm hết 😆",
    "Ván này em áp đảo 🤔",
  ],
  smart: [
    "Anh đang tự thu hẹp 🤔", "Cờ này thắng bằng đầu 🧠", "Nước đó quá dễ đoán 👀",
    "Em đã chờ nước này 🎯", "Anh bị chặn cả công lẫn thủ 🕸️", "Cờ này rất rõ ràng ♟️",
    "Em không cho anh xoay 😌", "Nước này quyết định 🤔", "Anh không gỡ được đâu 🧠",
    "Em đang kết thúc 👀", "Cờ này đã xong 🎯", "Anh bị dẫn từ đầu 🕸️",
    "Nước này là dấu chấm ♟️", "Em đã kiểm soát toàn cục 😌", "Anh không còn phản đòn 🤔",
    "Cờ này hết đường 🧠", "Em thắng bằng chiến lược 👀", "Anh bị khóa hoàn toàn 🎯",
    "Nước này kết thúc trung cục 🕸️", "Em không để anh thoát ♟️", "Cờ này đã định hình 😌",
    "Anh đang ở thế thua 🤔", "Em đã thấy kết quả 🧠", "Nước này là đòn cuối 👀",
    "Anh không còn nước tốt 🎯", "Cờ này không cứu được 🕸️", "Em đã tính đủ ♟️",
    "Anh không lật được đâu 😌", "Cờ này khép lại 🤔", "Em thắng bằng mưu 🧠",
    "Anh đã đi sai từ trước 👀", "Nước này kết thúc ván 🎯", "Cờ đã rõ thắng bại 🕸️",
  ],
  tease: [
    "Anh bắt đầu thiếu nước đẹp 😏", "Cờ này càng lúc càng rõ 😜", "Em không cần đánh nhanh 🤭",
    "Anh đang bị ép nhẹ 😂", "Nước này nhìn quen không? 🙃", "Em đã đoán được 👋",
    "Anh không còn nhiều lựa chọn 👀", "Cờ này coi bộ xong 😏", "Anh đang rối rồi 😜",
    "Em chờ nước sai cuối 🤭", "Anh thấy mệt chưa? 😂", "Cờ này em thắng từ từ 🙃",
    "Anh không thoát đâu 👋", "Em thích nhìn anh xoay 👀", "Nước này là em thích nhất 😏",
    "Anh đi càng lúc càng khó 😜", "Cờ này coi bộ hết 🤭", "Anh vẫn cố nha 😂",
    "Em cho anh thêm vài nước 🙃", "Anh đang tự dồn mình 👋", "Cờ này kết đẹp 👀",
    "Anh không cứu kịp đâu 😏", "Em cười từ đầu tới giờ 😜", "Cờ này vui ghê 🤭",
    "Anh hết đường rồi 😂", "Em chốt nha 🙃", "Anh chuẩn bị thua 👋",
    "Cờ này xong rồi 👀", "Anh thấy chưa? 😏", "Em nói rồi mà 😜",
    "Cờ này em thắng 🤭", "Anh cố gắng đáng khen 😂", "Nhưng vẫn thua thôi 🙃",
    "Hết ván nha 😏",
  ],
};

function getRandomFromList(list: string[]): string {
  const unused = list.filter(msg => !usedMessages.has(msg));
  if (unused.length === 0) {
    usedMessages.clear();
    return list[Math.floor(Math.random() * list.length)];
  }
  const msg = unused[Math.floor(Math.random() * unused.length)];
  usedMessages.add(msg);
  return msg;
}

// =====================================================
// GENERATE TALK
// =====================================================

export const getStrategicTalk = async (mode: 'sweet' | 'toxic', context: string): Promise<string> => {
  console.log('[DEBUG] Current Personality:', currentPersonality);
  const personality = PERSONALITIES[currentPersonality];
  const systemInstruction = mode === 'sweet' ? personality.sweetPrompt : personality.toxicPrompt;
  const randomSeed = Math.random().toString(36).substring(7);

  const prompt = `
    Bối cảnh: ${context}
    Random: ${randomSeed}
    
    QUAN TRỌNG: Viết 1 câu cà khịa hài hước, mỉa mai nhẹ nhàng (10-25 từ), tiếng Việt, SÁNG TẠO!
    Dùng phong cách kiếm hiệp hoặc đối thoại hóm hỉnh. 
    Tuyệt đối không dùng từ ngữ thô tục, xúc phạm nặng nề hoặc vi phạm thuần phong mỹ tục.
    Chỉ trả về câu thoại, không giải thích.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 1.3,
        topP: 0.95,
      },
    });

    let text = response.text?.trim()
      .replace(/^["']|["']$/g, '')
      .replace(/^\*+|\*+$/g, '')
      .replace(/^-\s*/, '');

    if (text && text.length > 3 && text.length < 80 && trackMessage(text)) {
      return text;
    }

    const list = mode === 'sweet' ? SWEET_TALKS[currentPersonality] : TOXIC_TALKS[currentPersonality];
    return getRandomFromList(list);

  } catch (error) {
    console.error("Gemini error:", error);
    const list = mode === 'sweet' ? SWEET_TALKS[currentPersonality] : TOXIC_TALKS[currentPersonality];
    return getRandomFromList(list);
  }
};

export const getIdleInsult = async (): Promise<string> => {
  const personality = PERSONALITIES[currentPersonality];
  const randomSeed = Math.random().toString(36).substring(7);

  const prompt = `${personality.idlePrompt}
  Viết 1 câu ngắn (6-10 từ) giục đi cờ. Random: ${randomSeed}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { temperature: 1.3 },
    });

    let text = response.text?.trim().replace(/^["']|["']$/g, '');
    if (text && text.length > 3 && text.length < 60 && trackMessage(text)) {
      return text;
    }

    return getRandomFromList(IDLE_TALKS[currentPersonality]);
  } catch {
    return getRandomFromList(IDLE_TALKS[currentPersonality]);
  }
};

let currentAudioSource: AudioBufferSourceNode | null = null;

export async function speakText(text: string, audioContext: AudioContext, mode: 'sweet' | 'toxic') {
  try {
    // Dừng âm thanh đang phát trước đó
    if (currentAudioSource) {
      try {
        currentAudioSource.stop();
      } catch (e) {
        // Có thể audio đã kết thúc tự động
      }
    }

    const personality = PERSONALITIES[currentPersonality];
    let voiceStyle = '';

    switch (currentPersonality) {
      case 'baby':
        voiceStyle = `Giọng em bé 5 tuổi, ngọng nghịu, dễ thương: ${text}`;
        break;
      case 'student':
        voiceStyle = `Giọng học sinh 12 tuổi, lễ phép, tò mò: ${text}`;
        break;
      case 'elder':
        voiceStyle = mode === 'sweet'
          ? `Giọng ông già ngọt ngào, giả tạo: ${text}`
          : `Giọng ông già cười đắc ý, khinh bỉ: ${text}`;
        break;
      case 'master':
        voiceStyle = `Giọng pháp sư bí ẩn, trầm, triết lý: ${text}`;
        break;
      case 'demon':
        voiceStyle = `Giọng ma vương tàn ác, đáng sợ, cười ác: ${text}`;
        break;
      case 'wise':
        voiceStyle = `Giọng phụ nữ điềm tĩnh, nhẹ nhàng, truyền cảm: ${text}`;
        break;
      case 'aggressive':
        voiceStyle = `Giọng phụ nữ mạnh mẽ, dứt khoát, uy lực, đầy năng lượng: ${text}`;
        break;
      case 'smart':
        voiceStyle = `Giọng phụ nữ trầm ấm, sắc sảo, có chiều sâu, hơi lạnh lùng: ${text}`;
        break;
      case 'tease':
        voiceStyle = `Giọng phụ nữ lém lỉnh, hài hước, trêu chọc, có chút tiếng cười: ${text}`;
        break;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: voiceStyle }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: mode === 'sweet' || currentPersonality === 'baby' || currentPersonality === 'student'
                ? 'Kore'
                : 'Charon'
            }
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      currentAudioSource = source;
      source.start();

      source.onended = () => {
        if (currentAudioSource === source) {
          currentAudioSource = null;
        }
      };
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export function resetTalkHistory() {
  usedMessages.clear();
}
