/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        this.label1 = new St.Label({ text: "Yükleniyor..." });
        this.actor.add_child(this.label1);

        this._updateLabel();
        
        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);
    }


    _updateLabel() {
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            try {
                let [ok, out, err, exit] = GLib.spawn_command_line_sync('cat /sys/bus/pci/devices/0000:01:00.0/power_state');
                if (ok) {
                    this.label1.set_text(out.toString());
                } else {
                    this.label1.set_text("Hata: " + err.toString());
                }
            } catch (e) {
                this.label1.set_text("Hata: " + e.message);
            }
            return true; // Devamlı çalışması için true döndürülür
        });
    }
});

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
