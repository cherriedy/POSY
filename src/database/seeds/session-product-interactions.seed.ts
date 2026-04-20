import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  TableSessionStatus,
  TableSessionType,
} from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tier = 'strong' | 'medium' | 'light';

interface Persona {
  name: string;
  strong: string[];
  medium: string[];
  light: string[];
}

interface SessionInfo {
  id: string;
  start_at: Date;
  end_at: Date;
}

// ---------------------------------------------------------------------------
// Persona definitions
//
// Each persona represents a realistic customer archetype.
//   strong → frequently viewed AND ordered multiple times  (high score)
//   medium → occasionally viewed, sometimes ordered once   (mid  score)
//   light  → only browsed / ordered at most once           (low  score)
//
// Products that overlap across personas (e.g. "Trà Đào" in VN_LUNCH and
// SEAFOOD_LOVER) deliberately create cross-persona signals that
// collaborative-filtering algorithms can exploit.
// ---------------------------------------------------------------------------
const PERSONAS: Persona[] = [
  // ── 1. VN_BREAKFAST ──────────────────────────────────────────────────────
  {
    name: 'VN_BREAKFAST',
    strong: [
      'Phở Bò Truyền Thống',
      'Bún Bò Huế',
      'Bánh Mì Thịt Nướng',
      'Cà Phê Sữa Đá Sài Gòn',
      'Bạc Xỉu Đá',
    ],
    medium: [
      'Hủ Tiếu Nam Vang',
      'Cà Phê Đen Đá',
      'Gỏi Cuốn Tôm Thịt',
      'Bánh Flan Caramel',
    ],
    light: [
      'Khoai Tây Chiên (Cỡ Vừa)',
      'Coca Cola Khổng Lồ',
      'Bắp Rang Bơ Truyền Thống',
    ],
  },

  // ── 2. VN_LUNCH ──────────────────────────────────────────────────────────
  {
    name: 'VN_LUNCH',
    strong: [
      'Cơm Tấm Sườn Bì Chả',
      'Bún Thịt Nướng Chả Giò',
      'Mì Quảng Ếch',
      'Trà Đào Cam Sả',
      'Trà Sữa Trân Châu Đường Đen',
    ],
    medium: [
      'Gỏi Cuốn Tôm Thịt',
      'Bánh Flan Caramel',
      'Sữa Chua Trân Châu',
      'Cà Phê Sữa Đá Sài Gòn',
    ],
    light: ['Bắp Rang Bơ Truyền Thống', 'Nước Ép Dưa Hấu', 'Cá Viên Chiên'],
  },

  // ── 3. VN_DINNER ─────────────────────────────────────────────────────────
  {
    name: 'VN_DINNER',
    strong: [
      'Bánh Xèo Tôm Nhảy',
      'Cơm Chiên Hải Sản',
      'Hủ Tiếu Nam Vang',
      'Trà Vải Nhiệt Đới',
      'Hồng Trà Macchiato',
    ],
    medium: [
      'Cơm Tấm Sườn Bì Chả',
      'Mực Xé Sợi Tẩm Gia Vị',
      'Chè Khúc Bạch',
      'Trứng Cút Nướng',
    ],
    light: ['Cá Viên Chiên', 'Sprite Chanh Tươi', 'Gỏi Cuốn Tôm Thịt'],
  },

  // ── 4. WESTERN_DINNER ────────────────────────────────────────────────────
  {
    name: 'WESTERN_DINNER',
    strong: [
      'Classic Cheeseburger',
      'Margherita Pizza',
      'Spaghetti Carbonara',
      'Coca Cola Khổng Lồ',
      'Sprite Chanh Tươi',
    ],
    medium: [
      'Caesar Salad',
      'Tiramisu',
      'Khoai Tây Chiên (Cỡ Vừa)',
      'Khoai Tây Lắc Phô Mai',
      'Fanta Cam',
    ],
    light: [
      'Bánh Brownie Socola',
      'Phở Bò Truyền Thống',
      'Bắp Rang Bơ Truyền Thống',
    ],
  },

  // ── 5. SEAFOOD_LOVER ─────────────────────────────────────────────────────
  {
    name: 'SEAFOOD_LOVER',
    strong: [
      'Salmon Sushi Roll',
      'Cơm Chiên Hải Sản',
      'Bánh Xèo Tôm Nhảy',
      'Matcha Latte Đá',
      'Trà Đào Cam Sả',
    ],
    medium: [
      'Gỏi Cuốn Tôm Thịt',
      'Sinh Tố Bơ',
      'Caesar Salad',
      'Panna Cotta Dâu Tây',
    ],
    light: ['Bắp Rang Bơ Truyền Thống', 'Nước Ép Dưa Hấu', 'Cá Viên Chiên'],
  },

  // ── 3. VN_DINNER
  {
    name: 'SNACK_CINEMA',
    strong: [
      'Bắp Rang Bơ Truyền Thống',
      'Bắp Rang Phủ Caramel',
      'Bắp Rang Phô Mai',
      'Khoai Tây Chiên (Cỡ Vừa)',
      'Coca Cola Khổng Lồ',
    ],
    medium: [
      'Nachos Sốt Phô Mai',
      'Hotdog Xúc Xích Phô Mai',
      'Gà Viên Chiên Giòn',
      'Sprite Chanh Tươi',
      'Fanta Cam',
    ],
    light: [
      'Khoai Tây Lắc Phô Mai',
      'Mực Xé Sợi Tẩm Gia Vị',
      'Xúc Xích Nướng Đá',
    ],
  },

  // ── 7. DESSERT_LOVER ─────────────────────────────────────────────────────
  {
    name: 'DESSERT_LOVER',
    strong: [
      'Tiramisu',
      'Bánh Mousse Trà Xanh',
      'Sữa Chua Trân Châu',
      'Matcha Latte Đá',
      'Trà Sữa Trân Châu Đường Đen',
    ],
    medium: [
      'Kem Vani (Viên)',
      'Kem Socola Đen',
      'Bánh Flan Caramel',
      'Panna Cotta Dâu Tây',
      'Bánh Brownie Socola',
    ],
    light: ['Chè Khúc Bạch', 'Sinh Tố Bơ', 'Trà Đào Cam Sả'],
  },

  // ── 8. HEALTHY ───────────────────────────────────────────────────────────
  {
    name: 'HEALTHY',
    strong: [
      'Caesar Salad',
      'Salmon Sushi Roll',
      'Gỏi Cuốn Tôm Thịt',
      'Nước Ép Cam Tươi',
      'Nước Ép Dưa Hấu',
    ],
    medium: [
      'Matcha Latte Đá',
      'Sinh Tố Bơ',
      'Bánh Xèo Tôm Nhảy',
      'Trà Đào Cam Sả',
    ],
    light: [
      'Khoai Tây Chiên (Cỡ Vừa)',
      'Kem Vani (Viên)',
      'Phở Bò Truyền Thống',
    ],
  },

  // ── 9. BUDGET ────────────────────────────────────────────────────────────
  {
    name: 'BUDGET',
    strong: [
      'Cá Viên Chiên',
      'Trứng Cút Nướng',
      'Xúc Xích Nướng Đá',
      'Cà Phê Đen Đá',
      'Bánh Mì Thịt Nướng',
    ],
    medium: [
      'Bắp Rang Bơ Truyền Thống',
      'Coca Cola Khổng Lồ',
      'Bánh Flan Caramel',
      'Cà Phê Sữa Đá Sài Gòn',
    ],
    light: [
      'Khoai Tây Chiên (Cỡ Vừa)',
      'Sprite Chanh Tươi',
      'Gỏi Cuốn Tôm Thịt',
    ],
  },

  // ── 10. CAFE_LOVER ───────────────────────────────────────────────────────
  {
    name: 'CAFE_LOVER',
    strong: [
      'Cà Phê Sữa Đá Sài Gòn',
      'Cà Phê Đen Đá',
      'Bạc Xỉu Đá',
      'Tiramisu',
      'Bánh Brownie Socola',
    ],
    medium: [
      'Hồng Trà Macchiato',
      'Matcha Latte Đá',
      'Bánh Flan Caramel',
      'Bánh Mì Thịt Nướng',
    ],
    light: [
      'Trà Sữa Trân Châu Đường Đen',
      'Bánh Mousse Trà Xanh',
      'Bắp Rang Bơ Truyền Thống',
    ],
  },
];

// ---------------------------------------------------------------------------
// Interaction value generators
// ---------------------------------------------------------------------------

/** Strongly liked product: many views, ordered multiple times. */
function strongInteraction(): {
  viewCount: number;
  orderCount: number;
  totalQuantity: number;
} {
  const viewCount = faker.number.int({ min: 5, max: 12 });
  const orderCount = faker.number.int({ min: 2, max: 5 });
  const totalQuantity = faker.number.int({
    min: orderCount,
    max: orderCount * 3,
  });
  return { viewCount, orderCount, totalQuantity };
}

/** Medium interest: a few views, ordered once or twice. */
function mediumInteraction(): {
  viewCount: number;
  orderCount: number;
  totalQuantity: number;
} {
  const viewCount = faker.number.int({ min: 3, max: 7 });
  const orderCount = faker.number.int({ min: 1, max: 2 });
  const totalQuantity = faker.number.int({
    min: orderCount,
    max: orderCount * 2,
  });
  return { viewCount, orderCount, totalQuantity };
}

/** Light / browse-only: glanced at, rarely or never ordered. */
function lightInteraction(): {
  viewCount: number;
  orderCount: number;
  totalQuantity: number;
} {
  const viewCount = faker.number.int({ min: 1, max: 4 });
  // 40 % impulse-order probability; 60 % browse-only
  const ordered = faker.datatype.boolean({ probability: 0.4 });
  const orderCount = ordered ? 1 : 0;
  const totalQuantity = ordered ? 1 : 0;
  return { viewCount, orderCount, totalQuantity };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

/**
 * Seeds `session_product_interactions` for AI / recommendation-system training.
 *
 * Strategy
 * ────────
 * 1. Ensure at least TARGET_TRAINING_SESSIONS completed TableSessions exist by
 *    creating new ones when the existing count falls short.
 * 2. Assign each session a persona (round-robin across 10 personas,
 *    8 sessions each = 80 sessions).
 * 3. Create SessionProductInteraction rows for every product referenced in the
 *    persona using tier-appropriate random values.
 * 4. Skip rows that already exist — fully idempotent.
 */
export async function seedSessionProductInteractions(
  prisma: PrismaClient,
): Promise<void> {
  const TARGET_TRAINING_SESSIONS = PERSONAS.length * 8; // 80

  // ── 1. Load products ──────────────────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: { is_deleted: false },
    select: { id: true, name: true, price: true },
  });

  if (!products.length) {
    throw new Error('No products found. Run seedProducts() before this seed.');
  }

  const pMap = new Map<string, { id: string; price: number }>();
  for (const p of products) {
    pMap.set(p.name, { id: p.id, price: parseFloat(p.price.toString()) });
  }

  // ── 2. Load tables ────────────────────────────────────────────────────────
  const tables = await prisma.table.findMany({
    where: { is_active: true },
    select: { id: true },
  });

  if (!tables.length) {
    throw new Error(
      'No active tables found. Run seedTables() before this seed.',
    );
  }

  // ── 3. Ensure enough COMPLETED training sessions ──────────────────────────
  const existingCompleted = await prisma.tableSession.findMany({
    where: { status: TableSessionStatus.COMPLETED },
    select: { id: true, start_at: true, end_at: true },
  });

  const sessionsToCreate = Math.max(
    0,
    TARGET_TRAINING_SESSIONS - existingCompleted.length,
  );

  const newSessions: SessionInfo[] = [];

  for (let i = 0; i < sessionsToCreate; i++) {
    const table = faker.helpers.arrayElement(tables);

    const startAt = faker.date.between({
      from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      to: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    const durationMs = faker.number.int({
      min: 30 * 60 * 1000, // 30 min
      max: 120 * 60 * 1000, // 2 hours
    });
    const endAt = new Date(startAt.getTime() + durationMs);

    const session = await prisma.tableSession.create({
      data: {
        table_id: table.id,
        session_token: faker.string.alphanumeric(128),
        device_fingerprint: faker.string.alphanumeric(256),
        status: TableSessionStatus.COMPLETED,
        session_type: TableSessionType.GUEST,
        start_at: startAt,
        end_at: endAt,
        expires_at: new Date(endAt.getTime() + 60 * 60 * 1000),
      },
    });

    newSessions.push({ id: session.id, start_at: startAt, end_at: endAt });
  }

  // Merge existing + newly created
  const allSessions: SessionInfo[] = [
    ...existingCompleted.map((s) => ({
      id: s.id,
      start_at: s.start_at,
      end_at: s.end_at ?? new Date(s.start_at.getTime() + 60 * 60 * 1000),
    })),
    ...newSessions,
  ];

  // ── 4. Create interaction rows ────────────────────────────────────────────
  for (let i = 0; i < allSessions.length; i++) {
    const session = allSessions[i];
    const persona = PERSONAS[i % PERSONAS.length];

    const entries: Array<{ name: string; tier: Tier }> = [
      ...persona.strong.map((name) => ({ name, tier: 'strong' as Tier })),
      ...persona.medium.map((name) => ({ name, tier: 'medium' as Tier })),
      ...persona.light.map((name) => ({ name, tier: 'light' as Tier })),
    ];

    for (const entry of entries) {
      const product = pMap.get(entry.name);
      if (!product) continue; // product not seeded yet – skip silently

      // Idempotency guard
      const exists = await prisma.sessionProductInteraction.findUnique({
        where: {
          session_id_product_id: {
            session_id: session.id,
            product_id: product.id,
          },
        },
      });
      if (exists) continue;

      let viewCount: number;
      let orderCount: number;
      let totalQuantity: number;

      if (entry.tier === 'strong') {
        ({ viewCount, orderCount, totalQuantity } = strongInteraction());
      } else if (entry.tier === 'medium') {
        ({ viewCount, orderCount, totalQuantity } = mediumInteraction());
      } else {
        ({ viewCount, orderCount, totalQuantity } = lightInteraction());
      }

      const totalSpent = orderCount > 0 ? product.price * totalQuantity : 0;

      // last_ordered must fall within the session's time window
      const lastOrdered =
        orderCount > 0
          ? faker.date.between({ from: session.start_at, to: session.end_at })
          : null;

      await prisma.sessionProductInteraction.create({
        data: {
          session_id: session.id,
          product_id: product.id,
          view_count: viewCount,
          order_count: orderCount,
          total_quantity: totalQuantity,
          total_spent: totalSpent,
          last_ordered: lastOrdered,
        },
      });
    }
  }

  console.log(
    `SessionProductInteraction seed complete. ` +
      `Processed ${allSessions.length} sessions across ${PERSONAS.length} personas.`,
  );
}
