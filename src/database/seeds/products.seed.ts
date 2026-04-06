import { faker } from '@faker-js/faker';
import { DietaryTag, MealSession, PrismaClient, Taste } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';
import { ProductDiscountType as DomainProductDiscountType } from '../../models/products/enums/product.enum';

if (!process.env.MEILI_HOST) {
  throw new Error('Meilisearch host is missing in environment variables.');
}

if (!process.env.MEILI_MASTER_KEY) {
  throw new Error(
    'Meilisearch master key is missing in environment variables.',
  );
}

const meiliClient = new MeiliSearch({
  host: process.env.MEILI_HOST,
  apiKey: process.env.MEILI_MASTER_KEY,
});

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export async function seedProducts(prisma: PrismaClient) {
  // The list below follows the user's collection: main dishes, snacks, drinks, desserts.
  const curated = [
    // Main dishes (category names and ingredients seeded in Vietnamese)
    {
      name: 'Cơm Tấm Sườn Bì Chả',
      description: 'Cơm tấm dẻo thơm ăn kèm sườn nướng mỡ hành.',
      price: 65000,
      taste_profile: [Taste.SALTY, Taste.SWEET],
      meal_session: MealSession.LUNCH,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: ['Cơm tấm', 'Sườn', 'Bì', 'Chả', 'Mỡ hành', 'Đồ chua'],
      discount_type: DomainProductDiscountType.FIXED_AMOUNT,
      discount_value: 5000,
    },
    {
      name: 'Phở Bò Truyền Thống',
      description: 'Phở bò nước trong, thơm mùi hoa hồi và quế.',
      price: 55000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.DAIRY_FREE, DietaryTag.GLUTEN_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: [
        'Bánh phở',
        'Nạm bò',
        'Xương bò',
        'Hoa hồi',
        'Quế',
        'Hành lá',
      ],
    },
    {
      name: 'Bún Bò Huế',
      description: 'Bún bò cay nồng đậm vị mắm ruốc, kèm chả cua và bắp bò.',
      price: 60000,
      taste_profile: [Taste.SALTY, Taste.SPICY],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: ['Bún', 'Bắp bò', 'Giò heo', 'Sả', 'Mắm ruốc'],
    },
    {
      name: 'Bánh Mì Thịt Nướng',
      description: 'Bánh mì giòn kẹp thịt nướng than hoa, đồ chua và pate.',
      price: 30000,
      taste_profile: [Taste.SALTY, Taste.SPICY],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: [
        'Bánh mì',
        'Thịt nướng',
        'Đồ chua',
        'Dưa leo',
        'Pâté',
        'Ngò',
      ],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 10,
    },
    {
      name: 'Gỏi Cuốn Tôm Thịt',
      description: 'Gỏi cuốn thanh mát tôm thịt, chấm tương đậu phộng.',
      price: 40000,
      taste_profile: [Taste.SWEET, Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: [
        'Bánh tráng',
        'Tôm',
        'Thịt heo',
        'Bún',
        'Xà lách',
        'Rau thơm',
      ],
    },
    {
      name: 'Mì Quảng Ếch',
      description: 'Mì Quảng ếch om sả nghệ đậm đà, bánh tráng giòn.',
      price: 50000,
      taste_profile: [Taste.SALTY, Taste.SPICY],
      meal_session: MealSession.LUNCH,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: ['Mì Quảng', 'Ếch', 'Nghệ', 'Sả', 'Đậu phộng', 'Bánh tráng'],
    },
    {
      name: 'Hủ Tiếu Nam Vang',
      description: 'Hủ tiếu tôm thịt, gan, trứng cút với nước lèo thanh ngọt.',
      price: 55000,
      taste_profile: [Taste.SALTY, Taste.SWEET],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: [
        'Bánh phở',
        'Tôm',
        'Thịt heo',
        'Gan heo',
        'Trứng cút',
        'Hành lá',
      ],
    },
    {
      name: 'Cơm Chiên Hải Sản',
      description: 'Cơm chiên tôm, mực, rắc thêm hành lá và tiêu.',
      price: 70000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.DINNER,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: ['Cơm', 'Tôm', 'Mực', 'Trứng', 'Hành lá'],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 15,
    },
    {
      name: 'Bún Thịt Nướng Chả Giò',
      description:
        'Bún tươi, thịt nướng, chả giò giòn rụm và nước mắm chua ngọt.',
      price: 45000,
      taste_profile: [Taste.SALTY, Taste.SWEET, Taste.SOUR],
      meal_session: MealSession.LUNCH,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: [
        'Bún',
        'Thịt nướng',
        'Chả giò',
        'Nước mắm chấm',
        'Rau thơm',
      ],
    },
    {
      name: 'Bánh Xèo Tôm Nhảy',
      description: 'Bánh xèo miền Trung giòn rụm, nhân tôm tươi sống.',
      price: 40000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.DINNER,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Món Chính',
      cuisine: 'Vietnamese',
      ingredients: ['Bột gạo', 'Nghệ', 'Tôm', 'Giá đỗ', 'Rau thơm'],
    },
    {
      name: 'Classic Cheeseburger',
      description: 'Burger bò băm nướng, phô mai cheddar và sốt đặc biệt.',
      price: 120000,
      taste_profile: [Taste.SALTY, Taste.SOUR],
      meal_session: MealSession.DINNER,
      dietary_tags: [],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: [
        'Patty bò',
        'Phô mai cheddar',
        'Bánh burger',
        'Xà lách',
        'Cà chua',
        'Sốt đặc biệt',
      ],
      discount_type: DomainProductDiscountType.FIXED_AMOUNT,
      discount_value: 20000,
    },
    {
      name: 'Margherita Pizza',
      description: 'Pizza đế mỏng, sốt cà chua tươi, mozzarella và húng quế.',
      price: 150000,
      taste_profile: [Taste.SALTY, Taste.SOUR],
      meal_session: MealSession.DINNER,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: ['Đế pizza', 'Sốt cà chua', 'Mozzarella', 'Húng quế'],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 15,
    },
    {
      name: 'Spaghetti Carbonara',
      description: 'Mì Ý sốt kem béo ngậy, thịt xông khói pancetta.',
      price: 140000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.DINNER,
      dietary_tags: [],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: [
        'Mì spaghetti',
        'Trứng',
        'Pancetta',
        'Phô mai parmesan',
        'Tiêu đen',
      ],
    },
    {
      name: 'Salmon Sushi Roll',
      description: 'Cơm cuộn cá hồi tươi sống và quả bơ.',
      price: 180000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.LUNCH,
      dietary_tags: [DietaryTag.DAIRY_FREE, DietaryTag.GLUTEN_FREE],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: ['Cơm sushi', 'Cá hồi', 'Bơ', 'Rong biển'],
    },
    {
      name: 'Caesar Salad',
      description: 'Salad xà lách Romaine, phô mai Parmesan và sốt Caesar.',
      price: 85000,
      taste_profile: [Taste.SALTY, Taste.SOUR],
      meal_session: MealSession.LUNCH,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Món Chính',
      cuisine: 'International',
      ingredients: [
        'Xà lách romaine',
        'Phô mai parmesan',
        'Bánh mì nướng',
        'Sốt Caesar',
      ],
    },

    // Snacks & combos (Vietnamese names)
    {
      name: 'Bắp Rang Bơ Truyền Thống',
      description: 'Bắp rang bơ nóng hổi, giòn tan, vị mặn nhẹ.',
      price: 49000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Bắp', 'Bơ', 'Muối'],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 10,
    },
    {
      name: 'Bắp Rang Phủ Caramel',
      description: 'Bắp rang áo lớp caramel ngọt ngào, giòn rụm.',
      price: 59000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Bắp', 'Caramel'],
    },
    {
      name: 'Bắp Rang Phô Mai',
      description: 'Bắp rang lắc bột phô mai mặn béo đậm đà.',
      price: 59000,
      taste_profile: [Taste.SALTY, Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Bắp', 'Bột phô mai'],
    },
    {
      name: 'Hotdog Xúc Xích Phô Mai',
      description: 'Xúc xích Đức kẹp bánh mì mềm, phủ mù tạt và tương cà.',
      price: 45000,
      taste_profile: [Taste.SALTY, Taste.SOUR],
      meal_session: MealSession.SNACK,
      dietary_tags: [],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Bánh hotdog', 'Xúc xích', 'Mù tạt', 'Tương cà'],
    },
    {
      name: 'Khoai Tây Chiên (Cỡ Vừa)',
      description: 'Khoai tây chiên vàng giòn, rắc muối tinh luyện.',
      price: 35000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Khoai tây', 'Muối', 'Dầu'],
    },
    {
      name: 'Khoai Tây Lắc Phô Mai',
      description: 'Khoai tây chiên lắc cùng bột phô mai thơm lừng.',
      price: 45000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Khoai tây', 'Bột phô mai'],
    },
    {
      name: 'Nachos Sốt Phô Mai',
      description: 'Bánh bắp giòn rụm chấm cùng sốt phô mai đun chảy.',
      price: 65000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Bánh ngô', 'Sốt phô mai'],
    },
    {
      name: 'Gà Viên Chiên Giòn',
      description: 'Thịt gà viên chiên giòn, thịt mềm ngọt bên trong.',
      price: 55000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Thịt gà', 'Bột chiên xù', 'Dầu'],
    },
    {
      name: 'Mực Xé Sợi Tẩm Gia Vị',
      description: 'Mực xé sợi dai ngon, tẩm gia vị mặn ngọt cay cay.',
      price: 40000,
      taste_profile: [Taste.SALTY, Taste.SPICY, Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Mực khô', 'Gia vị'],
    },
    {
      name: 'Xúc Xích Nướng Đá',
      description: 'Xúc xích nướng trên đá nóng, vỏ giòn, nhân thịt ầm.',
      price: 30000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Xúc xích'],
    },
    {
      name: 'Cá Viên Chiên',
      description: 'Xiên cá viên chiên giòn chấm tương ớt.',
      price: 20000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.DAIRY_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'International',
      ingredients: ['Chả cá', 'Bột chiên xù'],
    },
    {
      name: 'Trứng Cút Nướng',
      description: 'Trứng cút nướng mỡ hành trong chén nhỏ.',
      price: 25000,
      taste_profile: [Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.GLUTEN_FREE],
      category: 'Đồ Ăn Nhẹ',
      cuisine: 'Vietnamese',
      ingredients: ['Trứng cút', 'Mỡ hành'],
    },

    // Drinks (Thức Uống)
    {
      name: 'Coca Cola Khổng Lồ',
      description: 'Nước ngọt Coca Cola size L nhiều đá mát lạnh.',
      price: 35000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Coca Cola'],
    },
    {
      name: 'Sprite Chanh Tươi',
      description: 'Sprite kết hợp lát chanh tươi sảng khoái.',
      price: 35000,
      taste_profile: [Taste.SWEET, Taste.SOUR],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Sprite', 'Chanh'],
    },
    {
      name: 'Fanta Cam',
      description: 'Nước ngọt Fanta hương cam có ga.',
      price: 35000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Fanta'],
    },
    {
      name: 'Trà Sữa Trân Châu Đường Đen',
      description: 'Trà sữa đậm vị, trân châu dai mềm thấm đẫm đường đen.',
      price: 45000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Trà sữa', 'Trân châu đường đen', 'Sữa'],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 10,
    },
    {
      name: 'Trà Đào Cam Sả',
      description: 'Trà chua ngọt thanh mát, thơm mùi sả và đào miếng.',
      price: 40000,
      taste_profile: [Taste.SWEET, Taste.SOUR],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Trà', 'Đào', 'Sả'],
    },
    {
      name: 'Trà Vải Nhiệt Đới',
      description: 'Trà đen ủ lạnh pha syrup vải và trái vải ngâm.',
      price: 40000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Trà đen', 'Siro vải'],
    },
    {
      name: 'Hồng Trà Macchiato',
      description: 'Hồng trà thơm lừng phủ lớp kem cheese béo ngậy mặn mặn.',
      price: 45000,
      taste_profile: [Taste.SWEET, Taste.SALTY],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Trà đen', 'Kem cheese'],
    },
    {
      name: 'Cà Phê Sữa Đá Sài Gòn',
      description: 'Cà phê phin đậm đà pha với sữa đặc có đường.',
      price: 29000,
      taste_profile: [Taste.BITTER, Taste.SWEET],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'Vietnamese',
      ingredients: ['Cà phê', 'Sữa đặc'],
    },
    {
      name: 'Bạc Xỉu Đá',
      description:
        'Nhiều sữa đặc, chút cà phê tạo nên hương vị béo ngọt nhẹ nhàng.',
      price: 35000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'Vietnamese',
      ingredients: ['Cà phê', 'Sữa đặc'],
    },
    {
      name: 'Cà Phê Đen Đá',
      description: 'Cà phê nguyên chất đắng đậm, thêm đường và đá.',
      price: 25000,
      taste_profile: [Taste.BITTER],
      meal_session: MealSession.BREAKFAST,
      dietary_tags: [DietaryTag.VEGAN, DietaryTag.DAIRY_FREE],
      category: 'Thức Uống',
      cuisine: 'Vietnamese',
      ingredients: ['Cà phê'],
    },
    {
      name: 'Nước Ép Dưa Hấu',
      description: 'Nước ép dưa hấu tươi mát, không thêm đường.',
      price: 35000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN, DietaryTag.GLUTEN_FREE],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Dưa hấu'],
    },
    {
      name: 'Nước Ép Cam Tươi',
      description: 'Cam vắt nguyên chất, dồi dào vitamin C.',
      price: 40000,
      taste_profile: [Taste.SWEET, Taste.SOUR],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGAN, DietaryTag.GLUTEN_FREE],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Cam'],
    },
    {
      name: 'Matcha Latte Đá',
      description: 'Bột trà xanh Nhật Bản pha cùng sữa tươi nguyên kem.',
      price: 50000,
      taste_profile: [Taste.BITTER, Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Matcha', 'Sữa'],
    },
    {
      name: 'Sinh Tố Bơ',
      description: 'Bơ sáp xay nhuyễn cùng sữa tươi và sữa đặc béo ngậy.',
      price: 45000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Thức Uống',
      cuisine: 'International',
      ingredients: ['Bơ', 'Sữa', 'Sữa đặc'],
    },

    // Desserts (Tráng Miệng)
    {
      name: 'Kem Vani (Viên)',
      description: 'Kem Vani truyền thống mềm mịn, ngọt ngào.',
      price: 25000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Western',
      ingredients: ['Kem vani'],
    },
    {
      name: 'Kem Socola Đen',
      description: 'Kem vị socola đen đậm đặc, hơi đắng nhẹ.',
      price: 25000,
      taste_profile: [Taste.SWEET, Taste.BITTER],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Western',
      ingredients: ['Kem socola đen'],
    },
    {
      name: 'Bánh Flan Caramel',
      description: 'Bánh flan trứng sữa mềm mịn phủ lớp caramel đăng đắng.',
      price: 20000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Vietnamese',
      ingredients: ['Trứng', 'Sữa', 'Caramel'],
    },
    {
      name: 'Tiramisu',
      description: 'Bánh Tiramisu Ý ngấm vị cà phê và rượu Rhum.',
      price: 45000,
      taste_profile: [Taste.SWEET, Taste.BITTER],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Italian',
      ingredients: ['Mascarpone', 'Cà phê', 'Bánh ladyfingers'],
      discount_type: DomainProductDiscountType.PERCENTAGE,
      discount_value: 10,
    },
    {
      name: 'Bánh Mousse Trà Xanh',
      description: 'Bánh mousse mềm mịn, đậm vị matcha chát nhẹ.',
      price: 40000,
      taste_profile: [Taste.SWEET, Taste.BITTER],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Japanese',
      ingredients: ['Matcha', 'Kem'],
    },
    {
      name: 'Sữa Chua Trân Châu',
      description: 'Sữa chua dẻo chua ăn kèm trân châu cốt dừa béo.',
      price: 35000,
      taste_profile: [Taste.SOUR, Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Vietnamese',
      ingredients: ['Sữa chua', 'Trân châu'],
    },
    {
      name: 'Panna Cotta Dâu Tây',
      description: 'Kem sữa nấu đông kiểu Ý, rưới mứt dâu tây chua ngọt.',
      price: 35000,
      taste_profile: [Taste.SWEET, Taste.SOUR],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Italian',
      ingredients: ['Kem', 'Gelatin', 'Dâu tây'],
    },
    {
      name: 'Bánh Brownie Socola',
      description: 'Bánh socola nướng đặc, ẩm, kèm hạt óc chó.',
      price: 30000,
      taste_profile: [Taste.SWEET, Taste.BITTER],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Western',
      ingredients: ['Socola', 'Óc chó'],
    },
    {
      name: 'Chè Khúc Bạch',
      description:
        'Chè thanh mát với các viên khúc bạch sữa béo, nhãn lồng và hạnh nhân.',
      price: 35000,
      taste_profile: [Taste.SWEET],
      meal_session: MealSession.SNACK,
      dietary_tags: [DietaryTag.VEGETARIAN],
      category: 'Tráng Miệng',
      cuisine: 'Vietnamese',
      ingredients: ['Thạch sữa', 'Nhãn', 'Hạnh nhân'],
    },
  ].map((item, index) => ({
    ...item,
    image_url: `https://picsum.photos/seed/fooditem${index + 1}/500/500`,
  }));

  // --- Ensure categories exist
  const categoryNameSet = Array.from(new Set(curated.map((p) => p.category)));
  const categoryMap: Record<string, { id: string }> = {};
  for (const name of categoryNameSet) {
    let cat = await prisma.category.findFirst({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name,
          slug: generateSlug(name),
          is_active: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
    categoryMap[name] = cat;
  }

  // --- Ensure cuisines exist (Vietnamese, International, etc.)
  const cuisineNames = Array.from(new Set(curated.map((p) => p.cuisine)));
  const cuisineMap: Record<string, { id: string }> = {};
  for (const cname of cuisineNames) {
    let c = await prisma.cuisine.findFirst({ where: { name: cname } });
    if (!c) {
      c = await prisma.cuisine.create({
        data: {
          name: cname,
          region: cname === 'Vietnamese' ? 'VN' : 'INT',
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
    cuisineMap[cname] = c;
  }

  // Ensure at least one vendor and one unit exist because Ingredient requires vendor_id and unit_id
  let defaultVendor = await prisma.vendor.findFirst({
    where: { name: 'Default Vendor' },
  });
  if (!defaultVendor) {
    defaultVendor = await prisma.vendor.create({
      data: {
        name: 'Default Vendor',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  let defaultUnit = await prisma.unit.findFirst({
    where: { abbreviation: 'pcs' },
  });
  if (!defaultUnit) {
    defaultUnit = await prisma.unit.create({
      data: {
        name: 'piece',
        abbreviation: 'pcs',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // --- Ensure ingredients exist and build ingredient map
  const ingredientNames = Array.from(
    new Set(curated.flatMap((p) => p.ingredients)),
  );
  const ingredientMap: Record<string, { id: string }> = {};
  for (const iname of ingredientNames) {
    let ingr = await prisma.ingredient.findFirst({ where: { name: iname } });
    if (!ingr) {
      ingr = await prisma.ingredient.create({
        data: {
          vendor_id: defaultVendor.id,
          unit_id: defaultUnit.id,
          name: iname,
          stock: 0,
          min_stock: 0,
          unit_cost: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
    ingredientMap[iname] = ingr;
  }

  // --- Create products, attributes, and productIngredient links
  for (const p of curated) {
    // check existing product by name
    let prod = await prisma.product.findFirst({ where: { name: p.name } });
    if (!prod) {
      const sku = (
        generateSlug(p.name) +
        '-' +
        faker.string.alphanumeric(6)
      ).toUpperCase();
      prod = await prisma.product.create({
        data: {
          category_id: categoryMap[p.category].id,
          sku,
          name: p.name,
          slug: generateSlug(p.name),
          description: p.description,
          price: p.price,
          // use discount fields from curated list when present
          discount_type: p.discount_type ?? undefined,
          discount_value: p.discount_value ?? null,
          image_url: p.image_url,
          stock_quantity: 100,
          is_available: true,
          is_deleted: false,
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // product has been created or already existed; we'll re-query the DB later to obtain typed results
    // product attribute
    const existingAttr = await prisma.productAttribute.findUnique({
      where: { product_id: prod.id },
    });
    if (!existingAttr) {
      await prisma.productAttribute.create({
        data: {
          product_id: prod.id,
          cuisine_id: cuisineMap[p.cuisine].id,
          meal_session: p.meal_session,
          taste_profile: p.taste_profile,
          dietary_tags: p.dietary_tags,
          preparation_time: 15,
          spice_level: (p.taste_profile as Taste[]).includes(Taste.SPICY)
            ? 3
            : 1,
          is_seasonal: false,
        },
      });
    }

    // product ingredients
    const existingIng = await prisma.productIngredient.findMany({
      where: { product_id: prod.id },
      select: { ingredient_id: true },
    });
    const existingIds = new Set(existingIng.map((i) => i.ingredient_id));
    for (const iname of p.ingredients) {
      const ingr = ingredientMap[iname];
      if (ingr && !existingIds.has(ingr.id)) {
        await prisma.productIngredient.create({
          data: { product_id: prod.id, ingredient_id: ingr.id, quantity: 1 },
        });
      }
    }
  }

  // Re-query products created/ensured above so we have typed results
  const seededProducts = await prisma.product.findMany({
    where: { name: { in: curated.map((x) => x.name) } },
  });

  // Index to Meilisearch
  const productsForMeili = seededProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price:
      typeof p.price === 'object' && p.price !== null && 'toNumber' in p.price
        ? p.price.toNumber()
        : p.price,
    discountType: p.discount_type as DomainProductDiscountType,
    discountValue:
      p.discount_value !== null &&
      typeof p.discount_value === 'object' &&
      'toNumber' in p.discount_value
        ? p.discount_value.toNumber()
        : p.discount_value,
    imageUrl: p.image_url,
    isDeleted: p.is_deleted,
    isAvailable: p.is_available,
    stockQuantity: p.stock_quantity,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    categoryId: p.category_id,
    sku: p.sku,
    description: p.description,
    deletedAt: p.deleted_at,
  }));

  if (productsForMeili.length) {
    await meiliClient.index('products').addDocuments(productsForMeili);
  }
}
