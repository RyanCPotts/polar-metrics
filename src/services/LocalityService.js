import axios from 'axios';
import congressAPI from '../Components/CongressGovAPI';
import googleCivicDataAPI from '../Components/GoogleCivicDataAPI';

class LocalityService {
  constructor() {
    this.civicApiKey = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY;
    
    if (!this.civicApiKey) {
      console.error('Google Civic API key not found. Please add REACT_APP_GOOGLE_CIVIC_API_KEY to your .env file');
    }
  }

  // Extract Civic API logic into a service method
  async getCivicData(address) {
    try {
      const endpoint = `https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=${address}&key=${this.civicApiKey}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching civic data:', error);
      throw error;
    }
  }

  // Get congressional district info from address/ZIP
  async getDistrictInfo(address) {
    try {
      const civicData = await this.getCivicData(address);
      
      // Extract district information from civic data
      const districtInfo = {
        state: null,
        district: null,
        representatives: civicData.officials || [],
        offices: civicData.offices || []
      };

      // Parse district from offices data
      if (civicData.offices) {
        civicData.offices.forEach(office => {
          if (office.name && office.name.includes('Representative') && office.divisionId) {
            // Extract state and district from divisionId
            // Format: ocd-division/country:us/state:tx/cd:21
            const divisionMatch = office.divisionId.match(/state:(\w+)\/cd:(\d+)/);
            if (divisionMatch) {
              districtInfo.state = divisionMatch[1].toUpperCase();
              districtInfo.district = parseInt(divisionMatch[2]);
            }
          }
        });
      }

      return districtInfo;
    } catch (error) {
      console.error('Error getting district info:', error);
      return null;
    }
  }

  // Filter Congress members by state and district
  async getLocalRepresentatives(state, district = null) {
    try {
      // Get all members from the state
      const stateMembers = await congressAPI.getMembersByState(state);
      
      // If we have a specific district, try to filter by it
      if (district) {
        // Note: Congress API may not always have district info easily accessible
        // This is a basic filter - may need adjustment based on actual data structure
        const districtMembers = stateMembers.filter(member => {
          return member.district === district || 
                 member.district === district.toString() ||
                 (member.terms && member.terms.some(term => 
                   term.district === district || term.district === district.toString()
                 ));
        });
        
        // If we found district-specific members, return them; otherwise return all state members
        return districtMembers.length > 0 ? districtMembers : stateMembers;
      }
      
      return stateMembers;
    } catch (error) {
      console.error('Error getting local representatives:', error);
      return [];
    }
  }

  // Get bills sponsored or co-sponsored by local representatives
  async getLocalBills(representatives, limit = 20) {
    try {
      const localBills = [];
      
      // Get recent bills and filter by local representatives
      const recentBills = await congressAPI.getRecentBills(118, 100); // Get more to filter from
      
      for (const bill of recentBills) {
        if (localBills.length >= limit) break;
        
        // Check if any local representative is involved with this bill
        const hasLocalInvolvement = representatives.some(rep => {
          const bioguideId = rep.bioguideId || rep.bioGuideId;
          return bill.sponsors?.some(sponsor => sponsor.bioguideId === bioguideId) ||
                 bill.cosponsors?.some(cosponsor => cosponsor.bioguideId === bioguideId);
        });
        
        if (hasLocalInvolvement) {
          localBills.push(bill);
        }
      }
      
      return localBills;
    } catch (error) {
      console.error('Error getting local bills:', error);
      return [];
    }
  }

  // Main function to get all local political data
  async getLocalPoliticalData(address) {
    try {
      console.log(`Getting local political data for: ${address}`);
      
      // Step 1: Get district info from Civic API
      const districtInfo = await this.getDistrictInfo(address);
      if (!districtInfo) {
        throw new Error('Unable to determine district information');
      }
      
      console.log('District Info:', districtInfo);
      
      // Step 2: Get local representatives from Congress API
      const localReps = await this.getLocalRepresentatives(
        districtInfo.state, 
        districtInfo.district
      );
      
      // Step 3: Get bills related to local representatives
      const localBills = await this.getLocalBills(localReps, 10);
      
      // Step 4: Get recent votes from the state's representatives
      const recentVotes = await congressAPI.getRecentVotes(118, null, 20);
      
      // Step 5: Compile all local data
      const localData = {
        location: {
          address: address,
          state: districtInfo.state,
          district: districtInfo.district
        },
        representatives: {
          fromCivic: districtInfo.representatives,
          fromCongress: localReps
        },
        legislation: {
          localBills: localBills,
          recentVotes: recentVotes
        },
        summary: {
          totalLocalReps: localReps.length,
          totalLocalBills: localBills.length,
          lastUpdated: new Date().toISOString()
        }
      };
      
      console.log('Compiled local data:', localData);
      return localData;
      
    } catch (error) {
      console.error('Error getting local political data:', error);
      throw error;
    }
  }

  // Helper method to format data for display
  formatForDisplay(localData) {
    if (!localData) return [];
    
    const displayData = [
      `Location: ${localData.location.address}`,
      `Congressional District: ${localData.location.state}-${localData.location.district || 'At Large'}`,
      `Local Representatives: ${localData.summary.totalLocalReps}`,
      `Local Bills: ${localData.summary.totalLocalBills}`,
      `Data Updated: ${new Date(localData.summary.lastUpdated).toLocaleString()}`
    ];
    
    // Add representative names
    if (localData.representatives.fromCongress.length > 0) {
      displayData.push('--- REPRESENTATIVES ---');
      localData.representatives.fromCongress.forEach(rep => {
        const party = rep.party || rep.partyName || 'Unknown';
        const chamber = rep.terms?.[0]?.chamber || 'Unknown';
        displayData.push(`${rep.name || rep.directOrderName} (${party}) - ${chamber}`);
      });
    }
    
    // Add local bills
    if (localData.legislation.localBills.length > 0) {
      displayData.push('--- LOCAL BILLS ---');
      localData.legislation.localBills.slice(0, 5).forEach(bill => {
        displayData.push(`${bill.number}: ${bill.title || 'No title available'}`);
      });
    }
    
    return displayData;
  }
}

// Export a singleton instance
const localityService = new LocalityService();
export default localityService;v