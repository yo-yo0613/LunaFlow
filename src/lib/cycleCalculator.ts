import { CyclePhaseInfo, PhaseType } from '../types';
import { addDaysLocal, daysDifference, toLocalYYYYMMDD } from './dateUtils';

/**
 * 醫學黃體期逆推演算法 (Medical Backward Calculation Engine)
 * P_next (下次預測經期) = last_period_start + average_cycle_length
 * Ovulation (錨定排卵日) = P_next - 14 天
 */
export function calculateCyclePhase(
  lastPeriodStart: string,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5,
  targetDate: string = toLocalYYYYMMDD()
): CyclePhaseInfo {
  // 1. 確保基礎值合理 (週期介於 21 ~ 45 天，經期 3 ~ 8 天)
  const cycleLen = Math.max(21, Math.min(45, averageCycleLength || 28));
  const periodLen = Math.max(3, Math.min(8, averagePeriodLength || 5));

  // 2. 計算目標日期與上次經期開始日的天數差
  const totalDaysPassed = daysDifference(lastPeriodStart, targetDate);
  
  // 3. 換算出當前週期循環中的第幾天 (1-indexed, 1 到 cycleLen)
  let cycleDay = (totalDaysPassed % cycleLen);
  if (cycleDay < 0) {
    cycleDay = cycleLen + cycleDay;
  }
  cycleDay = cycleDay + 1; // 轉為 Day 1 ~ Day N

  // 4. 下次預計經期日與錨定排卵日
  const daysUntilNextPeriod = cycleLen - cycleDay + 1;
  const ovulationDay = cycleLen - 14; // 預估排卵日落在週期的第幾天 (例如 28-14=14)

  // 5. 醫學四階段切分
  let phase: PhaseType;
  let phaseName: string;
  let phaseSubtitle: string;
  let batteryPercent: number;
  let batteryLabel: string;
  let themeColor: string;
  let iconName: string;

  if (cycleDay <= periodLen) {
    // 階段 1: Recharge 舒緩修復期 (經期)
    phase = 'recharge';
    phaseName = 'Recharge 舒緩修復期';
    phaseSubtitle = '經期來臨・深層自我修復中';
    batteryPercent = Math.max(15, 30 - cycleDay * 2);
    batteryLabel = '電量 15% · 深度修復模式';
    themeColor = '#fb7185'; // Rose-500
    iconName = 'HeartHandshake';
  } else if (cycleDay <= ovulationDay - 3) {
    // 階段 2: Peak Energy 活力濾泡期
    phase = 'peak_energy';
    phaseName = 'Peak Energy 活力濾泡期';
    phaseSubtitle = '雌激素攀升・身心能量巔峰';
    batteryPercent = Math.min(95, 60 + (cycleDay - periodLen) * 6);
    batteryLabel = '電量 90% · 活力滿格模式';
    themeColor = '#f472b6'; // Rose-400
    iconName = 'Sparkles';
  } else if (cycleDay <= ovulationDay + 2) {
    // 階段 3: Golden Window 排卵黃金期
    phase = 'golden_window';
    phaseName = 'Golden Window 排卵黃金期';
    phaseSubtitle = '黃金窗口・體溫微升・心動高頻';
    batteryPercent = 100;
    batteryLabel = '電量 100% · 心動浪漫高頻期';
    themeColor = '#ec4899'; // Pink-500
    iconName = 'Flame';
  } else {
    // 階段 4: Vulnerable / PMS 經前敏感期
    phase = 'vulnerable';
    phaseName = 'Vulnerable 經前敏感期';
    phaseSubtitle = '黃體素波動・易疲憊・需要被溫柔以待';
    batteryPercent = Math.max(30, 65 - (cycleDay - ovulationDay) * 3);
    batteryLabel = '電量 40% · 高敏易碎模式';
    themeColor = '#fbcfe8'; // Rose-200
    iconName = 'Moon';
  }

  // 6. 暖男行動暗號與避坑指南庫
  const careGuides = {
    recharge: {
      badge: '深度守護・溫熱去冰',
      summary: '她的身體正在經歷劇烈代謝消耗，腹部可能悶痛或腰痠，體力與情緒耐受度較低。',
      actionTips: [
        '主動為她準備溫開水、熱黑糖薑茶或紅豆湯',
        '出門前包包默默備好一包衛生棉與暖暖包',
        '將冷氣調高 1 度，幫她蓋好小毛毯',
        '主動分擔家務，讓她能好好放鬆躺著'
      ],
      pitfallTips: [
        '絕對不要說「多喝熱水」四個字，直接把溫水端到她面前',
        '避免安排需要久站、長途跋涉或高強度的戶外行程',
        '切勿冷嘲熱諷或要求她立刻做決定'
      ],
      foodRecommendations: ['熱黑糖薑茶', '桂圓紅棗湯', '溫熱牛肉湯', '深綠色蔬菜補充鐵質']
    },
    peak_energy: {
      badge: '活力滿格・最佳約會',
      summary: '雌激素旺盛，大腦思緒最清晰、體力最充沛，心情明朗，是探索新事物的好時機。',
      actionTips: [
        '安排驚喜約會、戶外踏青或探索新餐廳',
        '可以一起做高強度運動、健身打卡或健行',
        '非常適合共同討論重要計畫或出遊規劃'
      ],
      pitfallTips: [
        '不要浪費這段黃金時光宅在家悶著',
        '把握她心情最好的時候多製造共同美好回憶'
      ],
      foodRecommendations: ['地中海輕食', '新鮮莓果優格', '高蛋白海鮮料理', '氣泡水果飲']
    },
    golden_window: {
      badge: '心動浪漫・親密高頻',
      summary: '排卵黃金期，女性魅力與親密感達到最高峰，體溫微升，情感更加細膩熱烈。',
      actionTips: [
        '安排浪漫燭光晚餐與私密相處時光',
        '主動給予熱烈且真誠的外貌與穿搭讚美',
        '順著她的熱情走，營造舒緩無壓力的氛圍'
      ],
      pitfallTips: [
        '若無備孕計畫，務必 100% 嚴密做好避孕安全措施！',
        '不要顯得敷衍或分心，全心全意投入陪伴'
      ],
      foodRecommendations: ['精緻法式甜點', '高抗氧化深色莓果', '微醺香檳或無酒精特調']
    },
    vulnerable: {
      badge: '高敏包容・甜食投餵',
      summary: '黃體素快速波動，可能伴隨水腫、胸脹、容易疲倦或情緒敏感，需要滿滿的安全感。',
      actionTips: [
        '甜食投餵戰術：默默買她喜歡的黑巧克力或可頌',
        '多給予溫暖擁抱，當一個耐心的傾聽者',
        '讚美她的付出，給予言語上的堅定肯定'
      ],
      pitfallTips: [
        '絕不說「妳是不是經前症候群又發作了？」這會瞬間引爆核彈',
        '絕不講大道理！她要的是情緒被理解，不是邏輯辯論',
        '別在她疲憊時催促或追問事情'
      ],
      foodRecommendations: ['70%以上優質黑巧克力', '香蕉燕麥飲 (豐富鎂)', '熱洋甘菊舒緩茶']
    }
  };

  return {
    phase,
    phaseName,
    phaseSubtitle,
    cycleDay,
    daysUntilNextPeriod,
    batteryPercent,
    batteryLabel,
    themeColor,
    iconName,
    careGuide: careGuides[phase]
  };
}

/**
 * 計算多個月經期歷史的滑動平均值 (Rolling Average)
 */
export function calculateRollingAverage(cycleLengths: number[]): number {
  if (!cycleLengths || cycleLengths.length === 0) return 28;
  const valid = cycleLengths.filter(len => len >= 20 && len <= 45);
  if (valid.length === 0) return 28;
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / valid.length);
}

/**
 * 計算預計下次經期開始日期
 */
export function getPredictedNextPeriodDate(lastPeriodStart: string, cycleLength: number = 28): string {
  return addDaysLocal(lastPeriodStart, cycleLength);
}
