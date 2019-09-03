do ( win = window, doc = document ) =>

    RATIO = 4

    $text_view = $ "#text_view"

    class Utils # static

        constructor : () ->

            throw "Utils cant be instantiated."

        @get_hsv_to_rgb : ( hsv ) =>

            h = hsv.h
            s = hsv.s
            v = hsv.v

            i = Math.floor( h / 60 ) % 6
            f = ( h / 60 ) - Math.floor( h / 60 )
            p = Math.round v * ( 1 - ( s / 255 ) )
            q = Math.round v * ( 1 - ( s / 255 ) * f )
            t = Math.round v * ( 1 - ( s / 255 ) * ( 1 - f ))

            switch i

                when 0 then rgb = { r : v, g : t, b : p }
                when 1 then rgb = { r : q, g : v, b : p }
                when 2 then rgb = { r : p, g : v, b : t }
                when 3 then rgb = { r : p, g : q, b : v }
                when 4 then rgb = { r : t, g : p, b : v }
                when 5 then rgb = { r : v, g : p, b : q }

            return rgb

        @clamp : ( min, max ) =>

            return Math.random() * ( max - min ) + min

        @central : ( p1, p2 ) =>

            return ( p2 - p1 ) * 0.5 + p1

        @central2d : ( p1, p2 ) =>

            return {
                x : ( p2.x - p1.x ) * 0.5 + p1.x
                y : ( p2.y - p1.y ) * 0.5 + p1.y
            }

        @round : ( num ) =>

            return Math.round( num * 10 ) / 10

        @dtr : ( d ) =>

            return d * ( Math.PI / 180 )

        @rtd : ( r ) =>

            return r * ( 180 / Math.PI )


    class Main

        constructor : () ->

            @init()

        init : () =>

            @set_key_event()
            @set_input_attention()

        set_key_event : () =>

            @input_text = doc.getElementById "input_text"

            @input_text.focus()

            change_handler = () =>

                $text_view
                    .html( @input_text.value )
                .end()

            barabara_handler = () =>

                texts = new Texts @input_text.value, $text_view.width() * RATIO, $text_view.height() * RATIO

                $text_view
                    .css(
                        width : $text_view.width()
                        height : $text_view.height()
                    )
                    .html("")
                .end()

                @input_text.value = ""

                for text in texts.trimming_groups

                    @set_dom_element text

                $text_view.attr "style", ""

            @input_text.addEventListener "keyup", ( event ) =>

                if event.keyCode is 13

                    barabara_handler()

                else

                    change_handler()

            @input_text.addEventListener "focus", ( event ) =>

                $text_view.removeClass "nofocus"

            @input_text.addEventListener "blur", ( event ) =>

                $text_view.addClass "nofocus"

            change_handler()
            barabara_handler()

        set_dom_element : ( text ) =>

            cvs = doc.createElement "canvas"
            ctx = cvs.getContext "2d"

            cvs.width  = w = text.rect.w
            cvs.height = h = text.rect.h

            output = ctx.createImageData w, h

            for row in text.pixels

                for obj in row

                    n = ( w * obj.y + obj.x ) * 4

                    output.data[ n ]     = 0
                    output.data[ n + 1 ] = 0
                    output.data[ n + 2 ] = 0
                    output.data[ n + 3 ] = obj.s

            ctx.putImageData output, 0, 0

            $("<img />")
                .attr( "width", text.rect.w / RATIO )
                .attr( "src", cvs.toDataURL() )
                .css(

                    top : text.rect.y / RATIO
                    left : text.rect.x / RATIO
                )
                .appendTo( $text_view )
                .box2d( { 'y-velocity' : 10, 'shape' : 'circle' } )
            .end()

        set_input_attention : () =>

            setInterval =>

                $text_view.toggleClass "active"

            ,500


    class Texts

        SIZE : 50 * RATIO

        ALPHA_THRESHOLD : 200

        constructor : ( @text, @cvs_w, @cvs_h ) ->

            @init()

        init : () =>

            @input = @set_input()

            @simplify_input = @set_input_simplify()

            @groups = @set_group()

            @trimming_groups = @set_trimming()

            # @debug_output @trimming_groups

            return @groups

        set_input : () =>

            input_cvs = doc.createElement "canvas"
            # input_cvs = doc.getElementById "c"
            input_ctx = input_cvs.getContext "2d"

            input_cvs.width  = @cvs_w
            input_cvs.height = @cvs_h
            
            text = @text

            input_ctx.font = "bold #{ @SIZE }px sans-serif"

            input_ctx.textAlign = "center"
            input_ctx.textBaseline = "middle"

            input_ctx.fillStyle = "black"
            input_ctx.fillText text, @cvs_w / 2, @cvs_h / 2

            return input_ctx.getImageData 0, 0, @cvs_w, @cvs_h

        set_input_simplify : () =>

            temp_data = new Array()

            width  = @input.width
            height = @input.height

            for i in [ 0...@input.data.length ] by 4

                alpha = @input.data[ i + 3 ]

                temp_data.push if alpha > @ALPHA_THRESHOLD then alpha else 0 # しきい値で切り捨て

            simplify_input = new Array()

            for i in [ 0...height ]

                w_data = new Array()

                h = i * width

                for j in [ 0...width ]

                    w = h + j

                    w_data.push temp_data[ w ]

                simplify_input.push w_data

            for h in [ 0...simplify_input.length ] # 凸になっている部分を削除

                t_w_data = simplify_input[ h - 1 ] or []
                m_w_data = simplify_input[ h ]
                b_w_data = simplify_input[ h + 1 ] or []

                for w in [ 0...m_w_data.length ]

                    t_c_s = t_w_data[ w ] or 0
                    b_c_s = b_w_data[ w ] or 0

                    m_l_s = m_w_data[ w - 1 ] or 0
                    m_r_s = m_w_data[ w + 1 ] or 0

                    m_w_data[ w ] = 0 if ( t_c_s is 0 ) and ( b_c_s is 0 )
                    m_w_data[ w ] = 0 if ( m_l_s is 0 ) and ( m_r_s is 0 )

            return simplify_input

        set_group : () =>

            debug_count = 0

            create_temp_group = ( h, w_data ) =>

                arr = new Array()

                for w in [ 0...( max = w_data.length ) ]

                    before = w_data[ w - 1 ]
                    current = w_data[ w ]

                    if ( before is undefined or before is 0 ) and current > 0

                        group = new Array()

                    if current > 0

                        group.push {

                            w : w
                            h : h
                            s : current
                        }

                    if before > 0 and current is 0

                        arr.push group

                    if w is ( max - 1 ) and current > 0

                        arr.push group

                return arr

            connect_group_and_w = ( groups, w_temp_group ) => # 現在のgroupとの接触をチェックし、接触している場合は結合

                done_group = null

                flag_done = false # 結合したgroupがあるか

                delete_group_numbers = new Array()

                for i in [ 0...groups.length ]

                    group = groups[ i ]

                    last_w_group = group[ group.length - 1 ]

                    flag_connect = false
                    flag_add_brother = false

                    if ( w_temp_group[0].h - last_w_group[0].h ) > 1 # group とhが完全に離れている場合

                        continue

                    if last_w_group[0].h is w_temp_group[0].h # すでに同じ行の違うグループが追加されている場合

                        flag_add_brother = true

                        last_w_group = group[ group.length - 2 ]

                        if last_w_group is undefined # 同じ行の違うグループしかない場合

                            continue

                    for current in w_temp_group

                        for before in last_w_group

                            if current.w is before.w

                                flag_connect = true

                                break

                        break if flag_connect

                    if flag_connect and flag_done

                        done_group = connect_group_and_group done_group, group

                        delete_group_numbers.push i # groups から group を削除する配列の番号

                    else if flag_connect

                        if flag_add_brother

                            group[ group.length - 1 ] = group[ group.length - 1 ].concat w_temp_group

                        else

                            group.push w_temp_group

                        done_group = group

                        flag_done = true

                for j in [ 0...delete_group_numbers.length ]

                    n = delete_group_numbers[ j ] - j

                    groups.splice n, 1 # groups から group を削除

                return done_group

            connect_group_and_group = ( group_1, group_2 ) => # groupとgroupを結合

                for i in [ 0...group_1.length ]

                    w_group_1 = group_1[ i ]

                    for j in [ 0...group_2.length ]

                        w_group_2 = group_2[ j ]

                        if w_group_1[0].h is w_group_2[0].h

                            group_1[ i ] = w_group_1.concat w_group_2

                return group_1

            temp_groups = new Array()

            do () =>

                for h in [ 0...@simplify_input.length ]

                    w_data = @simplify_input[ h ]

                    temp_group = create_temp_group h, w_data

                    temp_groups.push temp_group

            groups = new Array()

            do () =>

                for h in [ 0...temp_groups.length ]

                    b_temp_groups = temp_groups[ h - 1 ]
                    w_temp_groups = temp_groups[ h ]

                    for i in [ 0...w_temp_groups.length ]

                        w_temp_group = w_temp_groups[ i ]

                        debug_count += 1

                        if b_temp_groups is undefined or b_temp_groups.length is 0

                            group = new Array()

                            group.push w_temp_group # 新groupをつくって1行目を追加

                            groups.push group

                        else

                            group = connect_group_and_w groups, w_temp_group

                            if group is null

                                group = new Array()

                                group.push w_temp_group # 新groupをつくって1行目を追加

                                groups.push group

            return groups

        set_trimming : () =>

            trimming_groups = new Array()

            for group in @groups

                temp_min_x = null; temp_max_x = null
                temp_min_y = null; temp_max_y = null

                for row in group

                    for obj in row

                        temp_min_x = Math.min( obj.w, temp_min_x ) or obj.w
                        temp_max_x = Math.max( obj.w, temp_max_x ) or obj.w

                        temp_min_y = Math.min( obj.h, temp_min_y ) or obj.h
                        temp_max_y = Math.max( obj.h, temp_max_y ) or obj.h

                pixels = new Array()

                for row in group

                    temp_row = new Array()

                    for obj in row

                        temp_row.push {

                            x : obj.w - temp_min_x
                            y : obj.h - temp_min_y
                            s : obj.s
                        }

                    pixels.push temp_row

                trimming_groups.push {

                    rect : {

                        x : temp_min_x
                        y : temp_min_y
                        w : temp_max_x - temp_min_x + 1
                        h : temp_max_y - temp_min_y + 1
                    }

                    pixels : pixels
                }

            return trimming_groups

        debug_output : ( trimming_groups ) => # debug用

            output_cvs = doc.getElementById "c"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            color_hsv = { h : 0, s : 255, v : 255 }

            output = output_ctx.createImageData @cvs_w, @cvs_h

            for group in trimming_groups

                rgb = Utils.get_hsv_to_rgb color_hsv

                for w_group in group.pixels

                    for obj in w_group

                        n = ( @cvs_w * obj.y + obj.x ) * 4

                        output.data[ n ]     = rgb.r
                        output.data[ n + 1 ] = rgb.g
                        output.data[ n + 2 ] = rgb.b
                        output.data[ n + 3 ] = obj.s

                color_hsv.h += 45

                color_hsv.h = 0 if color_hsv.h > 360

            output_ctx.putImageData output, 0, 0

    

    win.addEventListener "load", =>

        new Main()

    ,false
