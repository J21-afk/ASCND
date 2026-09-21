/*
=========================================================
ASCND BUSINESS SYSTEMS FRAMEWORK
SYSTEM.JS — V2
=========================================================

Temporary V2 data layer.

For the demo:
CUSTOMER → REQUEST → SYSTEM → DASHBOARD

Later:
CUSTOMER → REQUEST → DATABASE → DASHBOARD → AUTOMATION
=========================================================
*/


const ASCND_SYSTEM = {

  storageKey: "ascnd_rental_requests",

  /*
  -------------------------------------------------------
  GET ALL REQUESTS
  -------------------------------------------------------
  */

  getRequests() {

    const stored =
      localStorage.getItem(this.storageKey);

    if (!stored) {
      return [];
    }

    try {

      return JSON.parse(stored);

    } catch (error) {

      console.error(
        "ASCND System: Could not read requests.",
        error
      );

      return [];

    }

  },


  /*
  -------------------------------------------------------
  SAVE ALL REQUESTS
  -------------------------------------------------------
  */

  saveRequests(requests) {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(requests)
    );

  },


  /*
  -------------------------------------------------------
  CREATE RENTAL REQUEST
  -------------------------------------------------------
  */

  createRentalRequest(data) {

    const requests = this.getRequests();

    const request = {

      id:
        "R-" +
        Date.now().toString().slice(-6),

      createdAt:
        new Date().toISOString(),

      customer: {

        name:
          data.name || "Unknown Customer",

        email:
          data.email || ""

      },

      rental: {

        experience:
          data.experience || "Rent & Explore",

        bike:
          data.bike || "Bike",

        date:
          data.date || "",

        duration:
          data.duration || ""

      },

      status: "Pending",

      nextAction: "Review Request"

    };


    requests.unshift(request);

    this.saveRequests(requests);

    return request;

  },


  /*
  -------------------------------------------------------
  UPDATE REQUEST STATUS
  -------------------------------------------------------
  */

  updateStatus(id, status) {

    const requests = this.getRequests();

    const request =
      requests.find(item => item.id === id);

    if (!request) {
      return null;
    }


    request.status = status;


    /*
      Change the suggested next action
      based on the rental status.
    */

    if (status === "Pending") {

      request.nextAction =
        "Review Request";

    }

    if (status === "Confirmed") {

      request.nextAction =
        "Prepare Rental";

    }

    if (status === "Active") {

      request.nextAction =
        "Track Return";

    }

    if (status === "Returning") {

      request.nextAction =
        "Confirm Return";

    }

    if (status === "Completed") {

      request.nextAction =
        "Send Follow-Up";

    }


    this.saveRequests(requests);

    return request;

  },


  /*
  -------------------------------------------------------
  FIND REQUEST
  -------------------------------------------------------
  */

  getRequest(id) {

    const requests = this.getRequests();

    return requests.find(
      item => item.id === id
    );

  },


  /*
  -------------------------------------------------------
  CLEAR DEMO DATA
  -------------------------------------------------------
  */

  clearDemoData() {

    localStorage.removeItem(
      this.storageKey
    );

  },


  /*
  -------------------------------------------------------
  DEMO DATA
  -------------------------------------------------------
  */

  seedDemoData() {

    const existing =
      this.getRequests();

    if (existing.length > 0) {
      return;
    }


    const demoRequests = [

      {
        id: "R-1048",

        createdAt:
          new Date().toISOString(),

        customer: {
          name: "Jordan Martinez",
          email: "jordan@example.com"
        },

        rental: {
          experience: "Mission Ride",
          bike: "E-Bike #07",
          date: "Today",
          duration: "4 Hours"
        },

        status: "Active",

        nextAction: "Track Return"
      },


      {
        id: "R-1047",

        createdAt:
          new Date().toISOString(),

        customer: {
          name: "Sarah Thompson",
          email: "sarah@example.com"
        },

        rental: {
          experience: "River Ride",
          bike: "Hybrid #14",
          date: "Today",
          duration: "4 Hours"
        },

        status: "Returning",

        nextAction: "Confirm Return"
      },


      {
        id: "R-1046",

        createdAt:
          new Date().toISOString(),

        customer: {
          name: "Marcus Wilson",
          email: "marcus@example.com"
        },

        rental: {
          experience: "City Ride",
          bike: "Road Bike #03",
          date: "Today",
          duration: "4 Hours"
        },

        status: "Pending",

        nextAction: "Review Request"
      }

    ];


    this.saveRequests(
      demoRequests
    );

  }

};


window.ASCND_SYSTEM = ASCND_SYSTEM;