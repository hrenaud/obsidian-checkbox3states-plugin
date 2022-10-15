import {
	App,
	ColorComponent,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TextComponent,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface ThirdStateSettings {
	touchduration: number;
	baseColor: string;
	hoverColor: string;
}

const DEFAULT_SETTINGS: ThirdStateSettings = {
	// touch duration before third check/uncheck
	touchduration: 300,
	baseColor: "#ff930a",
	hoverColor: "#c77a0f",
};

// timer var
let timer: ReturnType<typeof setTimeout>;
let longTouchDone = false;

export default class ThirdState extends Plugin {
	settings: ThirdStateSettings;

	// What to do onLoad Plugin
	async onload() {
		await this.loadSettings();

		// this add style html element to handle styles vars
		this.addStyle();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// Mouse event
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// console.log(evt);

			const checkbox = Object(evt.target);
			if (
				evt.shiftKey &&
				checkbox.className === "task-list-item-checkbox"
			) {
				evt.preventDefault();
				this.onCheckBoxChange(checkbox);
			}
		});

		// Touch Start Event
		this.registerDomEvent(
			document,
			"touchstart",
			(evt: TouchEvent) => {
				const checkbox = Object(evt.target);
				if (checkbox.className === "task-list-item-checkbox") {
					timer = setTimeout(
						this.onlongtouch,
						this.settings.touchduration,
						checkbox
					);
				}
			},
			{ passive: false }
		);

		// Touch End Event
		this.registerDomEvent(document, "touchend", (evt: TouchEvent) => {
			const checkbox = Object(evt.target);
			if (checkbox.className === "task-list-item-checkbox") {
				if (timer) clearTimeout(timer); // clearTimeout, not cleartimeout..
				if (longTouchDone) {
					evt.preventDefault();
					longTouchDone = false;
					return;
				}
			}
		});
	}

	/**
	 * Dispatched function with timer onLongTouch. Duration see `touchduration`
	 * @param checkbox
	 */
	onlongtouch = function (checkbox: HTMLElement) {
		longTouchDone = true;
		if (checkbox.dataset.task !== "/") {
			checkbox.dataset.task = "/";
		} else {
			checkbox.dataset.task = " ";
		}
		new Notice("Third state checkbox toggled!");
	};

	/**
	 * Handle checkbox interaction
	 * @param checkbox
	 */
	onCheckBoxChange = function (checkbox: HTMLElement) {
		if (checkbox.dataset.task !== "/") {
			checkbox.dataset.task = "/";
		} else {
			checkbox.dataset.task = " ";
		}
	};

	// What to do onUnLoad Plugin
	onunload() {
		this.removeStyle();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStyle();
	}

	/**
	 * Add style html element to handle styles vars
	 */
	addStyle() {
		// add a css block for our settings-dependent styles
		const css = document.createElement("style");
		css.id = "checkbox-3-state";
		document.getElementsByTagName("head")[0].appendChild(css);

		// update the style with the settings-dependent styles
		this.updateStyle();
	}

	/**
	 * Updatde style to be store in header.
	 * Trigger by `addStyle` when plugin loading
	 * Trigger by the changing of configuration
	 */
	updateStyle() {
		// get the custom css element
		const el = document.getElementById("checkbox-3-state");
		if (!el) throw "checkbox-3-state element not found!";
		else {
			// set the settings-dependent css
			el.innerText =
				":root {" +
				"--checkbox-3-state: " +
				this.settings.baseColor +
				";" +
				"--checkbox-3-state-accent: " +
				this.settings.hoverColor +
				";" +
				"--checkbox-marker-mid-color: var(--checkbox-3-state);" +
				"--checkbox-marker-mid-color-hover: var(--checkbox-3-state-accent);" +
				"}";
		}
	}

	// Clean html head on unload of plugin
	removeStyle() {
		const element = document.getElementById("checkbox-3-state");
		if (element) {
			element.remove();
		}
	}
}

/**
 * Configuration of settings pan
 */
class SampleSettingTab extends PluginSettingTab {
	plugin: ThirdState;

	constructor(app: App, plugin: ThirdState) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Checkbox 3 states plugin - Settings",
		});

		new Setting(containerEl)
			.setName("About 👋")
			.setDesc(
				"This plugin allows you to have a third state on the checkboxes of the task list. Do a [SHIFT]+[CLICK] on a checkbox to set this third state (not fully done). It adds a `/` instead of an `x` as a value. You can customize the colors below. Enjoy!"
			);
		const baseColorCustomization = new Setting(containerEl)
			.setName("Third state base color")
			.setDesc(
				"The color of the checkbox Default value: " +
					DEFAULT_SETTINGS.baseColor
			);
		const baseColorPicker = new ColorComponent(
			baseColorCustomization.controlEl
		)
			.setValue(this.plugin.settings.baseColor)
			.onChange(async (value) => {
				this.plugin.settings.baseColor = value;
				baseTextValue.setValue(value);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		const baseTextValue = new TextComponent(
			baseColorCustomization.controlEl
		)
			.setPlaceholder("Hexa value")
			.setValue(this.plugin.settings.baseColor)
			.onChange(async (value) => {
				this.plugin.settings.baseColor = value;
				baseColorPicker.setValue(value);
				await this.plugin.saveSettings();
			});
		baseColorCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.baseColor = DEFAULT_SETTINGS.baseColor;
				baseColorPicker.setValue(DEFAULT_SETTINGS.baseColor);
				baseTextValue.setValue(DEFAULT_SETTINGS.baseColor);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		baseColorCustomization.components.push(baseColorPicker, baseTextValue);

		const hoverColorCustomization = new Setting(containerEl)
			.setName("Third state hover color")
			.setDesc(
				"The color of the checkbox when your cursor is over. Default value: " +
					DEFAULT_SETTINGS.hoverColor
			);
		const hoverColorPicker = new ColorComponent(
			hoverColorCustomization.controlEl
		)
			.setValue(this.plugin.settings.hoverColor)
			.onChange(async (value) => {
				this.plugin.settings.hoverColor = value;
				hoverTextValue.setValue(value);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		const hoverTextValue = new TextComponent(
			hoverColorCustomization.controlEl
		)
			.setPlaceholder("Hexa value")
			.setValue(this.plugin.settings.hoverColor)
			.onChange(async (value) => {
				this.plugin.settings.hoverColor = value;
				hoverColorPicker.setValue(value);
				await this.plugin.saveSettings();
			});
		hoverColorCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.hoverColor = DEFAULT_SETTINGS.hoverColor;
				hoverColorPicker.setValue(DEFAULT_SETTINGS.hoverColor);
				hoverTextValue.setValue(DEFAULT_SETTINGS.hoverColor);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		hoverColorCustomization.components.push(
			hoverColorPicker,
			hoverTextValue
		);
	}
}
