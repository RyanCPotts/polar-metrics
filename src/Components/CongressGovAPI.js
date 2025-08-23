import axios from 'axios';

class CongressGovAPI {
  constructor() {
    this.baseURL = 'https://api.congress.gov/v3';
    this.apiKey = process.env.REACT_APP_CONGRESS_API_KEY;
    
    if (!this.apiKey) {
      console.error('Congress.gov API key not found. Please add REACT_APP_CONGRESS_API_KEY to your .env file');
    }
  }

  // Helper method to make authenticated requests
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          format: 'json',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Congress API Error:', error);
      throw error;
    }
  }

  // Get recent bills
  async getRecentBills(congress = 118, limit = 20) {
    try {
      const data = await this.makeRequest(`/bill/${congress}`, { 
        limit,
        sort: 'updateDate+desc'
      });
      return data.bills || [];
    } catch (error) {
      console.error('Error fetching recent bills:', error);
      return [];
    }
  }

  // Get bill details by ID
  async getBillDetails(congress, billType, billNumber) {
    try {
      const data = await this.makeRequest(`/bill/${congress}/${billType}/${billNumber}`);
      return data.bill || null;
    } catch (error) {
      console.error('Error fetching bill details:', error);
      return null;
    }
  }

  // Get all members of Congress
  async getMembers(congress = 118, chamber = null) {
    try {
      const endpoint = chamber 
        ? `/member/${congress}/${chamber}` 
        : `/member/${congress}`;
      
      const data = await this.makeRequest(endpoint, { limit: 250 });
      return data.members || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  }

  // Get member details by bioguide ID
  async getMemberDetails(bioguideId) {
    try {
      const data = await this.makeRequest(`/member/${bioguideId}`);
      return data.member || null;
    } catch (error) {
      console.error('Error fetching member details:', error);
      return null;
    }
  }

  // Search bills by keyword
  async searchBills(query, congress = 118, limit = 20) {
    try {
      const data = await this.makeRequest(`/bill/${congress}`, {
        q: query,
        limit,
        sort: 'updateDate+desc'
      });
      return data.bills || [];
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }

  // Get recent votes
  async getRecentVotes(congress = 118, chamber = null, limit = 20) {
    try {
      const endpoint = chamber 
        ? `/vote/${congress}/${chamber}`
        : `/vote/${congress}`;
      
      const data = await this.makeRequest(endpoint, { 
        limit,
        sort: 'date+desc'
      });
      return data.votes || [];
    } catch (error) {
      console.error('Error fetching votes:', error);
      return [];
    }
  }

  // Get committees
  async getCommittees(congress = 118, chamber = null) {
    try {
      const endpoint = chamber 
        ? `/committee/${congress}/${chamber}`
        : `/committee/${congress}`;
      
      const data = await this.makeRequest(endpoint, { limit: 100 });
      return data.committees || [];
    } catch (error) {
      console.error('Error fetching committees:', error);
      return [];
    }
  }

  // Get nominations (Senate only)
  async getNominations(congress = 118, limit = 20) {
    try {
      const data = await this.makeRequest(`/nomination/${congress}`, { 
        limit,
        sort: 'updateDate+desc'
      });
      return data.nominations || [];
    } catch (error) {
      console.error('Error fetching nominations:', error);
      return [];
    }
  }

  // Helper method to get member by state
  async getMembersByState(state, congress = 118) {
    try {
      const allMembers = await this.getMembers(congress);
      return allMembers.filter(member => 
        member.state && member.state.toLowerCase() === state.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching members by state:', error);
      return [];
    }
  }
}

// Export a singleton instance
const congressAPI = new CongressGovAPI();
export default congressAPI;