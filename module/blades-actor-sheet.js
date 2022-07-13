
import { BladesSheet } from "./blades-sheet.js";
import { BladesActiveEffect } from "./blades-active-effect.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesActorSheet extends BladesSheet {

  /** @override */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  classes: ["blades-in-the-dark", "sheet", "actor", "pc"],
  	  template: "systems/winter-of-discontent/templates/actor-sheet.html",
      width: 700,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    var data = super.getData();
    data.editable = this.options.editable;
    data.isGM = game.user.isGM;
    const actorData = data.data;
    data.actor = actorData;
    data.data = actorData.data;

    // Prepare active effects
    data.effects = BladesActiveEffect.prepareActiveEffectCategories(this.actor.effects);


    // Note any ability that affect actor data
    // @todo - fix translation.
    let mule_present, enhanced_injury_limit, enhanced_shock_limit;


    data.items.forEach(i => {
      if (i.type == "ability"){
        if (i.name == "(C) Mule") {mule_present = true;}
        if (i.name == "Bound in Darkness") {enhanced_shock_limit = true;}
      }
    });

    // Calculate Load
    let loadout = 0;
    data.items.forEach(i => {loadout += (i.type === "item") ? parseInt(i.data.load) : 0});
    data.data.loadout = loadout;
    
    // Encumbrance Levels
    let load_level=["BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal","BITD.Heavy","BITD.Encumbered",
			"BITD.Encumbered","BITD.Encumbered","BITD.OverMax"];
    let mule_level=["BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Light","BITD.Normal","BITD.Normal",
			"BITD.Heavy","BITD.Encumbered","BITD.OverMax"];
    
    //Sanity Check
    if (loadout < 0) {
      loadout = 0;
    }
    if (loadout > 10) {
      loadout = 10;
    }



    //set encumbrance level
    if (mule_present) {
      data.data.load_level=mule_level[loadout];
    } else {
      data.data.load_level=load_level[loadout];   
    }
    
    data.load_levels = {"BITD.Light":"BITD.Light", "BITD.Normal":"BITD.Normal", "BITD.Heavy":"BITD.Heavy"};



    // Calculate Harm
    let injury = 0;
    let shock = 0;
    let injury_max = enhanced_injury_limit ? 5 : 4;
    let shock_max = enhanced_shock_limit ? 5 : 4;

    let harm = {}
    data.items.forEach(i =>{
      if( i.type !== "harm_card") return;
      injury += parseInt(i.data.injury_value);
      shock += parseInt(i.data.shock_value);
    });

    // Sanity Check - Ensure injury/shock values are within expected range
    if (injury < 0) { injury=0;}
    if (injury > injury_max) { injury=injury_max;}
    data.data.harm.injury = String(injury);
    data.data.injury_max = injury_max;

    if (shock < 0) { shock=0;}
    if (shock > injury_max) { shock=injury_max;}
    data.data.harm.shock = String(shock);
    data.data.shock_max = shock_max;

    // Sanity Check - Ensure recovery details match the recovery_card
    //                Reset recovery if the card is missing or not a harm_card
    let recovery = {...data.data.recovery};
    let recovery_card = data.items.find(i => i._id === recovery.harmId && i.type === "harm_card")
    if(recovery_card){
      let treatment = recovery_card.data.treatment;
      recovery.position = treatment.position;
      recovery.clock = treatment.clock;
    }else{
      recovery = game.system.template.Actor.character.recovery;
    }
    data.data.recovery = recovery;

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    // Recover from Harm Cards
    html.find('.harm-card-recovery').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.startRecovery(element.data("itemId"));
      this.render(false)
    });

    //Cancel treatment
    html.find('.cancel-recovery').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");      
      await this.actor.cancelRecovery();
      element.slideUp(200, () => this.render(false));
    });

    // manage active effects
    html.find(".effect-control").click(ev => BladesActiveEffect.onManageActiveEffect(ev, this.actor));
  }

  /* -------------------------------------------- */

}
