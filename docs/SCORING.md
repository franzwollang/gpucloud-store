# GPUCloud Datacenter Risk & Capability Scoring

_A standardized framework for evaluating datacenter suitability for GPU workloads._

This document defines the **canonical meanings**, **scoring methodology**, and **usage guidelines** for all datacenter risk and capability metrics surfaced in GPUCloud’s provider selection UI.

The goal is to provide GPU buyers with **clear, defensible, GPU-specific insights** into datacenter quality without overwhelming them with operational minutiae.

---

# Table of Contents

1. [Overview](#overview)
2. [Scoring Scale](#scoring-scale)
3. [Canonical Metric Definitions](#canonical-metric-definitions)
   - Natural Disaster Risk
   - Electricity Reliability
   - Fire Risk
   - Security Breach Risk
   - Power Efficiency
   - Cost Efficiency
   - Network Reliability
   - Cooling Capacity
   - Lead Time Reliability
   - Carbon Intensity
   - Rack Density Support
4. [Qualitative Thresholds](#qualitative-thresholds)
5. [Practical Scoring Procedure](#practical-scoring-procedure)
6. [Examples & Mapping](#examples--mapping)
7. [Optional Metric: Regulatory Risk](#optional-metric-regulatory-risk)

---

# Overview

Datacenters differ **dramatically** in their engineering quality, regional stability, cooling performance, network topology, and operational practices.  
For GPU workloads—especially dense multi-GPU nodes and multi-week training jobs—these differences are **material**.

GPUCloud assigns each datacenter a **1–5 score** for a set of metrics grouped into:

- **Environmental Stability**
- **Electrical & Cooling Performance**
- **Network & Redundancy**
- **Security & Operational Quality**
- **Cost & Efficiency**

The scoring system is intentionally simple, explainable, and robust.

---

# Scoring Scale

Every metric uses a **1–5 rating**, where:

| Score | Meaning       | Summary                                    |
| ----- | ------------- | ------------------------------------------ |
| **1** | Poor          | High risk, weak capability                 |
| **2** | Below Average | Some concerns or structural weaknesses     |
| **3** | Typical       | Meets baseline expectations for modern DCs |
| **4** | Strong        | High capability, low risk                  |
| **5** | Excellent     | Best-in-class performance or reliability   |

This scale maps cleanly to real-world datacenter tiers and GPU facility requirements.

---

# Canonical Metric Definitions

Each definition is written to align with **GPU workloads**, **providers**, and **long-running contracts (1–12 months)**.

---

## **1. Natural Disaster Risk**

**Definition:**  
Likelihood that the facility experiences service interruptions due to environmental events  
(earthquakes, flooding, storms, hurricanes, wildfire, etc.) over the contract duration.

**Drivers:**

- Regional hazard zones
- Floodplain levels
- Seismic activity
- Weather volatility
- Emergency infrastructure quality

---

## **2. Electricity Reliability**

**Definition:**  
Stability of electrical supply including grid reliability, on-site generation, UPS redundancy, and historical uptime.

**Drivers:**

- Grid stability (country + region)
- Generator redundancy (N, N+1, 2N)
- UPS design & maintenance
- Recent power incidents
- Fuel contract reliability

---

## **3. Fire Risk**

**Definition:**  
Effectiveness of fire detection, prevention, suppression systems, and structural compartmentalization.

**Drivers:**

- Suppression systems (FM-200/NOVEC/water mist/dry pipe)
- Electrical system age
- Fire compartmentalization
- Airflow design
- Material fire load

---

## **4. Security Breach Risk**

**Definition:**  
Strength of physical and operational security protecting against unauthorized access or service disruption.

**Drivers:**

- 24/7 manned security
- Biometric authentication
- Rack-level security
- CCTV coverage
- Audit compliance (SOC 2, ISO 27001)

---

## **5. Power Efficiency**

**Definition:**  
Overall electrical and cooling efficiency, especially under continuous high-density GPU load.

**Drivers:**

- PUE (Power Usage Effectiveness)
- Cooling method (air / evaporative / liquid)
- Climate advantage (Nordics vs hot climates)
- Airflow management quality

---

## **6. Cost Efficiency**

**Definition:**  
Structural cost-effectiveness of operating GPUs at this facility, influenced by energy costs, cooling efficiency, and scale economics.

**Drivers:**

- Regional kWh price
- Renewable sources
- Cooling efficiency
- Facility scale
- Waste heat reuse

---

## **7. Network Reliability**

**Definition:**  
Carrier diversity, fiber path redundancy, routing hardware quality, and historical network performance (loss/jitter/outages).

**Drivers:**

- Single vs multi-carrier connectivity
- Diverse path routing
- Cross-connect infrastructure
- Routing hardware
- Regional backbone reliability

---

## **8. Cooling Capacity**

**Definition:**  
Ability to sustain high-density GPU loads (20–100+ kW per rack) under continuous operation without throttling or derating.

**Drivers:**

- Max supported rack density
- Liquid cooling availability
- Chiller redundancy
- Hot/cold aisle engineering
- Heatwave derating behavior

---

## **9. Lead Time Reliability**

**Definition:**  
Consistency with which the provider meets provisioning timelines for GPU nodes, racks, cross-connects, and cluster setup.

**Drivers:**

- Staffing levels
- Hardware inventory accuracy
- Past delays
- Internal ticketing systems
- Contractual SLAs

---

## **10. Carbon Intensity**

**Definition:**  
Average carbon emissions per kWh of electricity powering the datacenter during the service period.

**Drivers:**

- Grid mix (nuclear/hydro vs fossil)
- Seasonal variations
- PPA contracts
- Datacenter sustainability design

---

## **11. Rack Density Support**

**Definition:**  
Maximum supported rack density (power + cooling), especially relevant for modern GPU nodes and DGX/HGX systems.

**Drivers:**

- 10 kW (legacy) vs 30–60 kW (modern) vs 100+ kW (liquid cooled)
- PDUs and power rails
- Cooling plant capability
- Airflow/pipe infrastructure

---

# Qualitative Thresholds

Each metric should map to the following qualitative categories:

### **Score 1 — Poor**

- Known outages or chronic issues
- Inadequate redundancy
- High risk region (flood, fire, seismic)
- Aging infrastructure
- Single-carrier or single-path dependencies

### **Score 2 — Below Average**

- Some redundancy, but uneven performance
- Older facility with partial upgrades
- Moderate weather/grid/security concerns
- Limited GPU rack density support

### **Score 3 — Typical**

- Meets Tier II–III baseline expectations
- Standard cooling suitable for medium GPU loads
- Good but not exceptional network availability
- Standard physical security controls

### **Score 4 — Strong**

- Tier III+ execution
- High-density cooling capability (20–40 kW)
- Multi-carrier connectivity
- Strong electrical redundancy
- Strong compliance posture

### **Score 5 — Excellent**

- Tier III+/IV modern facility
- Liquid cooling / extreme efficiency
- Cold region climate advantage
- Top-tier network routing
- 40–100+ kW GPU rack support
- Best-in-class uptime history

---

# Practical Scoring Procedure

A simple 3-step scoring flow that is **transparent**, **defensible**, and **easy to maintain**:

---

## **Step 1 — Normalize Qualitative Inputs**

Gather qualitative descriptions from:

- provider spec sheets
- datacenter fact books
- region data (e.g., grid reliability, natural hazard maps)
- internal experience
- third-party resources (Uptime Institute, ENTSO-E, etc.)

Assign one of these descriptors per metric:

- **Poor**
- **Below Average**
- **Typical**
- **Strong**
- **Excellent**

---

## **Step 2 — Convert to Numeric Scores**

Use the following conversion:

| Qualitative   | Numeric |
| ------------- | ------- |
| Poor          | **1**   |
| Below Average | **2**   |
| Typical       | **3**   |
| Strong        | **4**   |
| Excellent     | **5**   |

---

## **Step 3 — Optional Override / Weighting**

For GPU workloads, certain metrics may be more important:

- Cooling Capacity
- Rack Density Support
- Electricity Reliability
- Network Reliability

You may optionally weight these 2× in a composite score.

---

# Examples & Mapping

### **Example A — Nordic HPC Datacenter**

- Natural Disaster Risk: 5
- Electricity Reliability: 5
- Fire Risk: 4
- Security Breach Risk: 4
- Power Efficiency: 5
- Cost Efficiency: 5
- Network Reliability: 5
- Cooling Capacity: 5
- Lead Time Reliability: 4
- Carbon Intensity: 5
- Rack Density Support: 5

**Summary:**  
An ideal environment for dense GPU clusters.

---

### **Example B — US West Legacy Colocation**

- Natural Disaster Risk: 2
- Electricity Reliability: 3
- Fire Risk: 3
- Security Breach Risk: 3
- Power Efficiency: 2
- Cost Efficiency: 2
- Network Reliability: 3
- Cooling Capacity: 2
- Lead Time Reliability: 3
- Carbon Intensity: 2
- Rack Density Support: 2

**Summary:**  
Usable for moderate loads; unsuitable for large GPU deployments.

---

### **Example C — Hot Climate, Modern Build**

- Natural Disaster Risk: 3
- Electricity Reliability: 4
- Fire Risk: 4
- Security Breach Risk: 4
- Power Efficiency: 2
- Cost Efficiency: 3
- Network Reliability: 4
- Cooling Capacity: 3
- Lead Time Reliability: 4
- Carbon Intensity: 2
- Rack Density Support: 4

**Summary:**  
Strong overall but limited by climate and cost efficiency.

---

# End of Document
