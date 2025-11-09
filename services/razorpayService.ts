// Razorpay Payment Service
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name?: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 100, // ₹100
    currency: 'INR',
    duration: '1 month',
    features: [
      'Unlimited prompt optimizations',
      'Private prompts',
      'Priority support',
      'Advanced AI models',
      'No daily credit limits'
    ]
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 1000, // ₹1000 (save ₹200)
    currency: 'INR',
    duration: '1 year',
    features: [
      'Unlimited prompt optimizations',
      'Private prompts',
      'Priority support',
      'Advanced AI models',
      'No daily credit limits',
      'Save ₹200 per year'
    ]
  }
];

export class RazorpayService {
  private keyId: string;

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    
    if (!this.keyId) {
      console.warn('Razorpay Key ID not configured');
    }
  }

  /**
   * Load Razorpay script dynamically
   */
  async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Open Razorpay payment modal
   */
  async openPaymentModal(
    plan: SubscriptionPlan,
    userEmail: string,
    userName?: string
  ): Promise<RazorpayResponse> {
    // Load Razorpay script
    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay. Please check your internet connection.');
    }

    if (!this.keyId) {
      throw new Error('Razorpay is not configured. Please contact support.');
    }

    return new Promise((resolve, reject) => {
      const options: RazorpayOptions = {
        key: this.keyId,
        amount: plan.price * 100, // Convert to paise
        currency: plan.currency,
        name: 'Promptify Pro',
        description: `${plan.name} Subscription`,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#1F2937', // Gray-800 to match app theme
        },
        handler: (response: RazorpayResponse) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  }

  /**
   * Verify payment (this should be done on backend in production)
   * For now, we'll just check if we have a payment ID
   */
  verifyPayment(response: RazorpayResponse): boolean {
    return !!response.razorpay_payment_id;
  }

  /**
   * Get plan by ID
   */
  getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  /**
   * Calculate subscription expiry date
   */
  calculateExpiryDate(plan: SubscriptionPlan): Date {
    const now = new Date();
    if (plan.id.includes('yearly')) {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now;
  }
}

export const razorpayService = new RazorpayService();
