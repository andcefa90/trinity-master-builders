/* global wp, jQuery */
// Admin: media pickers (single image / gallery) and the visual hotspot editor.
(function ($) {
	'use strict';

	function renderPreview($box, attachments, multiple) {
		var $p = $box.find('.trinity-media__preview');
		if (!multiple) $p.empty();
		attachments.forEach(function (a) {
			var url = (a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url);
			$p.append('<span data-id="' + a.id + '"><img src="' + url + '" alt=""></span>');
		});
	}

	function syncIds($box) {
		var ids = $box.find('.trinity-media__preview [data-id]').map(function () { return $(this).data('id'); }).get();
		$box.find('input[type=hidden]').first().val(ids.join(','));
	}

	$(document).on('click', '.trinity-media__pick', function (e) {
		e.preventDefault();
		var $box = $(this).closest('.trinity-media');
		var multiple = String($box.data('multiple')) === '1';
		var frame = wp.media({ title: multiple ? 'Add images' : 'Choose image', multiple: multiple ? 'add' : false, library: { type: 'image' } });
		frame.on('select', function () {
			renderPreview($box, frame.state().get('selection').toJSON(), multiple);
			syncIds($box);
		});
		frame.open();
	});

	$(document).on('click', '.trinity-media__clear', function (e) {
		e.preventDefault();
		var $box = $(this).closest('.trinity-media');
		$box.find('.trinity-media__preview').empty();
		syncIds($box);
	});

	// Click a gallery thumbnail to remove it; drag to reorder (jQuery UI sortable ships with WordPress).
	$(document).on('click', '.trinity-media[data-multiple="1"] .trinity-media__preview span', function () {
		var $box = $(this).closest('.trinity-media');
		$(this).remove();
		syncIds($box);
	});
	$(function () {
		if ($.fn.sortable) {
			$('.trinity-media[data-multiple="1"] .trinity-media__preview').sortable({ update: function () { syncIds($(this).closest('.trinity-media')); } });
		}
	});

	// Hotspot editor.
	$(function () {
		$('.trinity-hotspots').each(function () {
			var $wrap = $(this);
			var $input = $wrap.find('input[type=hidden]');
			var $stage = $wrap.find('.trinity-hotspots__stage');
			var $list = $wrap.find('.trinity-hotspots__list');
			if (!$stage.length) return;
			var spots = [];
			try { spots = JSON.parse($input.val() || '[]') || []; } catch (err) { spots = []; }

			function save() { $input.val(spots.length ? JSON.stringify(spots) : ''); }
			function draw() {
				$stage.find('.trinity-hotspots__dot').remove();
				$list.empty();
				spots.forEach(function (s, i) {
					$stage.append('<span class="trinity-hotspots__dot" style="left:' + s.x + '%;top:' + s.y + '%">' + (i + 1) + '</span>');
					var $row = $('<div class="trinity-hotspots__row"><strong>' + (i + 1) + '</strong>' +
						'<input type="text" placeholder="Label (e.g. Fire feature)">' +
						'<textarea rows="2" placeholder="One or two sentences"></textarea>' +
						'<button type="button" class="button-link-delete">Remove</button></div>');
					$row.find('input').val(s.label || '').on('input', function () { s.label = this.value; save(); });
					$row.find('textarea').val(s.text || '').on('input', function () { s.text = this.value; save(); });
					$row.find('button').on('click', function () { spots.splice(i, 1); save(); draw(); });
					$list.append($row);
				});
			}
			$stage.on('click', 'img', function (e) {
				if (spots.length >= 12) return;
				var r = this.getBoundingClientRect();
				spots.push({ x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 10, y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 10, label: '', text: '' });
				save();
				draw();
				$list.find('input').last().trigger('focus');
			});
			draw();
		});
	});
})(jQuery);
