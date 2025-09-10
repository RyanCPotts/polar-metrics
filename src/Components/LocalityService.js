const LocalityService = {
  extractState: (civicData) => {
    try {
      const state = civicData.normalizedInput.state;
      return state || "DC";
    } catch {
      return "DC";
    }
  },
};

export default LocalityService;
