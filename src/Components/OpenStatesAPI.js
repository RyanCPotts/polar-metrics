// OpenStatesData.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OpenStatesData = () => {
  const [legislators, setLegislators] = useState([]);
  const [bills, setBills] = useState([]);
  const [votes, setVotes] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [events, setEvents] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('ok');
  const [selectedSession, setSelectedSession] = useState('');
  const [activeTab, setActiveTab] = useState('legislators');
  const [loadingStates, setLoadingStates] = useState({});

  const apiKey = process.env.REACT_APP_OPENSTATES_API_KEY;

  const apiRequest = async (endpoint, params = {}) => {
    if (!apiKey) {
      throw new Error('OpenStates API key not found. Make sure REACT_APP_OPENSTATES_API_KEY is set in your .env file');
    }

    const response = await axios.get(`https://v3.openstates.org${endpoint}`, {
      headers: { 'X-API-Key': apiKey },
      params: { per_page: 50, ...params }
    });
    return response.data;
  };

  const fetchData = async (dataType, endpoint, params, setter) => {
    try {
      setLoadingStates(prev => ({ ...prev, [dataType]: true }));
      const data = await apiRequest(endpoint, params);
      setter(data.results || data);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [dataType]: false }));
    }
  };

  // Initialize jurisdictions and sessions
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get all jurisdictions
        const jurisdictionsData = await apiRequest('/jurisdictions');
        setJurisdictions(jurisdictionsData.results || []);
        
        // Get sessions for default state
        const sessionsData = await apiRequest(`/jurisdictions/${selectedState}`);
        setSessions(sessionsData.legislative_sessions || []);
        if (sessionsData.legislative_sessions?.length > 0) {
          setSelectedSession(sessionsData.legislative_sessions[0].identifier);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (apiKey) {
      initializeData();
    }
  }, [apiKey]);

  // Fetch data when state changes
  useEffect(() => {
    if (!selectedState || loading) return;

    const fetchAllData = async () => {
      const baseParams = { jurisdiction: selectedState };
      const sessionParams = selectedSession ? 
        { ...baseParams, session: selectedSession } : baseParams;

      await Promise.all([
        fetchData('legislators', '/people', baseParams, setLegislators),
        fetchData('bills', '/bills', sessionParams, setBills),
        fetchData('votes', '/votes', sessionParams, setVotes),
        fetchData('committees', '/committees', baseParams, setCommittees),
        fetchData('events', '/events', baseParams, setEvents)
      ]);

      // Get sessions for new state
      try {
        const jurisdictionData = await apiRequest(`/jurisdictions/${selectedState}`);
        setSessions(jurisdictionData.legislative_sessions || []);
        if (jurisdictionData.legislative_sessions?.length > 0 && !selectedSession) {
          setSelectedSession(jurisdictionData.legislative_sessions[0].identifier);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchAllData();
  }, [selectedState, selectedSession]);

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedSession(''); // Reset session when state changes
  };

  const handleSessionChange = (event) => {
    setSelectedSession(event.target.value);
  };

  const TabButton = ({ tabKey, label, count }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      style={{
        padding: '10px 15px',
        marginRight: '5px',
        backgroundColor: activeTab === tabKey ? '#007cba' : '#f0f0f0',
        color: activeTab === tabKey ? 'white' : 'black',
        border: '1px solid #ccc',
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer'
      }}
    >
      {label} {count !== undefined && `(${count})`}
      {loadingStates[tabKey] && ' ⏳'}
    </button>
  );

  const LoadingIndicator = ({ show }) => 
    show ? <div style={{ padding: '10px', fontStyle: 'italic' }}>Loading...</div> : null;

  if (loading) {
    return <div>Initializing OpenStates data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const stateOptions = jurisdictions
    .filter(j => j.classification === 'state')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="state-select" style={{ marginRight: '10px' }}>State: </label>
          <select id="state-select" value={selectedState} onChange={handleStateChange}>
            {stateOptions.map(state => (
              <option key={state.id} value={state.id}>{state.name}</option>
            ))}
          </select>
        </div>
        
        {sessions.length > 0 && (
          <div>
            <label htmlFor="session-select" style={{ marginRight: '10px' }}>Session: </label>
            <select id="session-select" value={selectedSession} onChange={handleSessionChange}>
              <option value="">All Sessions</option>
              {sessions.map(session => (
                <option key={session.identifier} value={session.identifier}>
                  {session.name} ({session.identifier})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <TabButton tabKey="legislators" label="Legislators" count={legislators.length} />
        <TabButton tabKey="bills" label="Bills" count={bills.length} />
        <TabButton tabKey="votes" label="Votes" count={votes.length} />
        <TabButton tabKey="committees" label="Committees" count={committees.length} />
        <TabButton tabKey="events" label="Events" count={events.length} />
      </div>

      {/* Content */}
      <div style={{ border: '1px solid #ccc', borderRadius: '0 5px 5px 5px', padding: '15px', minHeight: '400px' }}>
        
        {/* Legislators Tab */}
        {activeTab === 'legislators' && (
          <div>
            <h3>State Legislators</h3>
            <LoadingIndicator show={loadingStates.legislators} />
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {legislators.map((legislator) => (
                <div key={legislator.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                  <strong>{legislator.name}</strong> ({legislator.party || 'Unknown'})
                  <br />
                  <small>
                    {legislator.current_role?.title} - District {legislator.current_role?.district}
                    {legislator.email && ` | ${legislator.email}`}
                    {legislator.capitol_office?.voice && ` | ${legislator.capitol_office.voice}`}
                  </small>
                  {legislator.links && legislator.links.length > 0 && (
                    <div>
                      {legislator.links.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px', fontSize: '12px' }}>
                          {link.note || 'Website'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div>
            <h3>Bills</h3>
            <LoadingIndicator show={loadingStates.bills} />
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {bills.map((bill) => (
                <div key={bill.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                  <strong>{bill.identifier}</strong>: {bill.title}
                  <br />
                  <small>
                    Session: {bill.session} | Subject: {bill.subject?.join(', ') || 'N/A'}
                    <br />
                    Status: {bill.latest_action_description} ({new Date(bill.latest_action_date).toLocaleDateString()})
                    <br />
                    Sponsors: {bill.sponsorships?.map(s => s.name).join(', ') || 'None listed'}
                  </small>
                  {bill.abstracts && bill.abstracts.length > 0 && (
                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                      {bill.abstracts[0].abstract.substring(0, 200)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <div>
            <h3>Legislative Votes</h3>
            <LoadingIndicator show={loadingStates.votes} />
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {votes.map((vote) => (
                <div key={vote.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                  <strong>{vote.motion_text}</strong>
                  <br />
                  <small>
                    Bill: {vote.bill?.identifier} | Session: {vote.session}
                    <br />
                    Date: {new Date(vote.start_date).toLocaleDateString()} | 
                    Result: {vote.result} | 
                    Yes: {vote.counts?.find(c => c.option === 'yes')?.value || 0} | 
                    No: {vote.counts?.find(c => c.option === 'no')?.value || 0}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Committees Tab */}
        {activeTab === 'committees' && (
          <div>
            <h3>Legislative Committees</h3>
            <LoadingIndicator show={loadingStates.committees} />
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {committees.map((committee) => (
                <div key={committee.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                  <strong>{committee.name}</strong>
                  <br />
                  <small>
                    Chamber: {committee.chamber} | 
                    Classification: {committee.classification}
                    {committee.parent && ` | Parent: ${committee.parent.name}`}
                  </small>
                  {committee.memberships && committee.memberships.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Members:</strong>
                      <div style={{ fontSize: '12px', marginTop: '3px' }}>
                        {committee.memberships.slice(0, 5).map((member, idx) => (
                          <span key={idx}>
                            {member.person.name} ({member.role})
                            {idx < Math.min(4, committee.memberships.length - 1) && ', '}
                          </span>
                        ))}
                        {committee.memberships.length > 5 && ` ...and ${committee.memberships.length - 5} more`}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <h3>Legislative Events</h3>
            <LoadingIndicator show={loadingStates.events} />
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {events.map((event) => (
                <div key={event.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                  <strong>{event.name}</strong>
                  <br />
                  <small>
                    Date: {new Date(event.start_date).toLocaleString()} | 
                    Status: {event.status} | 
                    Location: {event.location?.name || 'TBD'}
                  </small>
                  {event.description && (
                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                      {event.description.substring(0, 150)}...
                    </div>
                  )}
                  {event.agenda && event.agenda.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Agenda Items:</strong>
                      <ul style={{ margin: '3px 0', paddingLeft: '20px', fontSize: '12px' }}>
                        {event.agenda.slice(0, 3).map((item, idx) => (
                          <li key={idx}>{item.description}</li>
                        ))}
                        {event.agenda.length > 3 && <li>...and {event.agenda.length - 3} more items</li>}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenStatesData; 