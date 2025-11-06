// Blacklist service to prevent deleted users from recreating accounts
export class BlacklistService {
  private static readonly BLACKLIST_KEY = 'promptify_deleted_accounts';

  // Add email to blacklist when account is deleted
  static addToBlacklist(email: string): void {
    try {
      const blacklist = this.getBlacklist();
      if (!blacklist.includes(email.toLowerCase())) {
        blacklist.push(email.toLowerCase());
        localStorage.setItem(this.BLACKLIST_KEY, JSON.stringify(blacklist));
      }
    } catch (error) {
      console.error('Failed to add email to blacklist:', error);
    }
  }

  // Check if email is blacklisted
  static isBlacklisted(email: string): boolean {
    try {
      const blacklist = this.getBlacklist();
      return blacklist.includes(email.toLowerCase());
    } catch (error) {
      console.error('Failed to check blacklist:', error);
      return false;
    }
  }

  // Get current blacklist
  private static getBlacklist(): string[] {
    try {
      const blacklistRaw = localStorage.getItem(this.BLACKLIST_KEY);
      return blacklistRaw ? JSON.parse(blacklistRaw) : [];
    } catch (error) {
      console.error('Failed to parse blacklist:', error);
      return [];
    }
  }

  // Remove from blacklist (admin function - not exposed in UI)
  static removeFromBlacklist(email: string): void {
    try {
      const blacklist = this.getBlacklist();
      const filteredList = blacklist.filter(e => e !== email.toLowerCase());
      localStorage.setItem(this.BLACKLIST_KEY, JSON.stringify(filteredList));
    } catch (error) {
      console.error('Failed to remove email from blacklist:', error);
    }
  }

  // Get blacklist count (for admin purposes)
  static getBlacklistCount(): number {
    return this.getBlacklist().length;
  }
}

export const blacklistService = BlacklistService;