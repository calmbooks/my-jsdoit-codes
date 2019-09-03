do ( win = window, doc = document ) =>

    FPS = 30

    FOV_Y = 90

    canvas_t = doc.getElementById "c_triangle"
    canvas_l = doc.getElementById "c_line"

    image_wrapper = doc.getElementById "image"

    cvs_w = win.innerWidth / 2
    cvs_h = win.innerHeight

    canvas_t.width  = cvs_w
    canvas_t.height = cvs_h

    canvas_l.width  = cvs_w
    canvas_l.height = cvs_h

    ASPECT = cvs_w / cvs_h

    gl_t = canvas_t.getContext "webgl" or canvas_t.getContext "experimental-webgl"
    gl_l = canvas_l.getContext "webgl" or canvas_l.getContext "experimental-webgl"

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

            @scene_t = new TriangleScene gl_t
            @scene_l = new LineScene gl_l

            @renderer_t = new Renderer gl_t
            @renderer_l = new Renderer gl_l

            @renderer_t.add_scene @scene_t
            @renderer_l.add_scene @scene_l

            @renderer_t.setup_update()
            @renderer_l.setup_update()

            @set_image "http://jsrun.it/assets/4/3/j/7/43j7k.png"

            @set_dragdrop_events()

        set_dragdrop_events : () =>

            
            doc.body.addEventListener "dragover", ( event ) =>

                event.preventDefault()

            , false

            doc.body.addEventListener "drop", ( event ) =>

                event.preventDefault()

                files = event.dataTransfer.files

                reader = new FileReader()

                reader.addEventListener "load", ( event ) =>

                    @set_image event.target.result

                , false

                reader.readAsDataURL files[0]

            , false

        set_image : ( image_url ) =>

            image = new Image()

            image.addEventListener "load", =>

                image2d = new Image2d image

                image3d_t = new Image3d "triangle", gl_t, image2d.get_data_3d(), [ 1.0, 0.2, 0.0, 1.0 ]
                image3d_l = new Image3d "line", gl_l, image2d.get_data_3d(), [ 0.0, 0.8, 0.0, 1.0 ]

                @scene_t.remove_all_children()
                @scene_l.remove_all_children()

                @scene_t.add_child image3d_t
                @scene_l.add_child image3d_l

                image_wrapper.removeChild image_wrapper.childNodes.item(0) if image_wrapper.childNodes.length

                image_wrapper.appendChild image

            ,false

            image.src = image_url


    class Image2d

        SIZE : 200

        ALPHA_THRESHOLD : 200 # 扱うピクセルのalphaしきい値

        SIMPLIFY_1_THRESHOLD : 5 # まびくためのしきい値（ angle ）
        SIMPLIFY_2_THRESHOLD : 3 # まびくためのしきい値（ angle ）

        REMOVE_DUST_THRESHOLD : 5 # まびくためのしきい値（ angle ）

        Z_THICKNESS : 0.1 # 奥行きの長さ

        constructor : ( @image ) ->

            @init()

        init : () =>

        get_data_3d : () =>

            @input = @set_input()

            @simplify_input = @set_input_simplify()

            @groups = @set_group()

            @edges = @set_edges()

            @points = @set_edges_simplify()

            @data_3d = @set_data_3d()

            # @debug_text_output()

            @debug_groups_output @groups
            @debug_edges_output @edges
            @debug_edges_normal_output @edges
            @debug_points_output @points
            @debug_face_output @data_3d, @points

            return @data_3d

        set_input : () =>

            input_cvs = doc.getElementById "input"
            input_ctx = input_cvs.getContext "2d"

            input_cvs.width  = @cvs_w = @SIZE
            input_cvs.height = @cvs_h = @SIZE

            image_ratio = @image.width / @image.height

            if @image.width > @image.height

                draw_w = @cvs_w
                draw_h = @cvs_w / image_ratio

                draw_x = 0
                draw_y = ( @cvs_h - draw_h ) / 2

            else

                draw_h = @cvs_h
                draw_w = @cvs_h * image_ratio

                draw_x = ( @cvs_w - draw_w ) / 2
                draw_y = 0

            input_ctx.fillStyle = "white"
            input_ctx.fillRect 0, 0, @cvs_w, @cvs_h

            input_ctx.drawImage @image, draw_x, draw_y, draw_w, draw_h

            input = input_ctx.getImageData 0, 0, @cvs_w, @cvs_h

            output = input_ctx.createImageData @cvs_w, @cvs_h

            i = input.data.length

            while 0 < i

                i -= 4

                r = input.data[ i ]
                g = input.data[ i + 1 ]
                b = input.data[ i + 2 ]
                a = input.data[ i + 3 ]

                brightness = Math.max( r, g, b ) * ( a / 255 )

                output.data[ i ]     = 0
                output.data[ i + 1 ] = 0
                output.data[ i + 2 ] = 0
                output.data[ i + 3 ] = if brightness < 200 then 255 else 255 - ( ( brightness - 200 ) / 55 * 255 )

            input_ctx.putImageData output, 0, 0

            return output

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

        set_edges : () =>

            v_l = 10 # 仮想ベクトルの強さ

            v45_x = v45_y = Math.sqrt ( v_l * v_l ) / 2 # 仮想ベクトル45のxとy

            edge_check = ( obj, t_w_group, m_w_group, b_w_group ) =>

                l_w = obj.w - 1
                c_w = obj.w
                r_w = obj.w + 1

                m_c_s = obj.s

                t_l_s = t_c_s = t_r_s = 0
                b_l_s = b_c_s = b_r_s = 0
                m_l_s = m_r_s = 0

                for o in t_w_group

                    w = o.w

                    t_l_s = o.s if w is l_w
                    t_c_s = o.s if w is c_w
                    t_r_s = o.s if w is r_w

                for o in m_w_group

                    w = o.w

                    m_l_s = o.s if w is l_w
                    m_r_s = o.s if w is r_w

                for o in b_w_group

                    w = o.w

                    b_l_s = o.s if w is l_w
                    b_c_s = o.s if w is c_w
                    b_r_s = o.s if w is r_w

                edge_bool = true if ( t_c_s is 0 ) or ( m_l_s is 0 ) or ( m_r_s is 0 ) or ( b_c_s is 0 )

                if edge_bool # edgeの場合、法線を求める

                    t_l_s = 255 - t_l_s
                    t_c_s = 255 - t_c_s
                    t_r_s = 255 - t_r_s

                    m_l_s = 255 - m_l_s
                    m_r_s = 255 - m_r_s

                    b_l_s = 255 - b_l_s
                    b_c_s = 255 - b_c_s
                    b_r_s = 255 - b_r_s

                    t_l = [ -v45_x * t_l_s, v45_y * t_l_s ]
                    t_c = [ 0, v_l * t_c_s ]
                    t_r = [ v45_x * t_r_s, v45_y * t_r_s ]

                    m_l = [ -v_l * m_l_s, 0 ]
                    m_r = [ v_l * m_r_s, 0 ]

                    b_l = [ -v45_x * b_l_s, -v45_y * b_l_s ]
                    b_c = [ 0, -v_l * b_c_s ]
                    b_r = [ v45_x * b_r_s, -v45_y * b_r_s ]

                    total_x = t_l[0] + t_c[0] + t_r[0] + m_l[0] + m_r[0] + b_l[0] + b_c[0] + b_r[0]
                    total_y = t_l[1] + t_c[1] + t_r[1] + m_l[1] + m_r[1] + b_l[1] + b_c[1] + b_r[1]

                    angle = Utils.rtd Math.atan2( total_y, total_x )

                    angle = if ( angle < 0 )    then ( angle + 360 ) else angle
                    angle = if ( angle >= 360 ) then ( angle - 360 ) else angle

                    obj.n = angle # 法線角度 0 <= angle < 360

                    return obj

                else

                    return null

            temp_edges = new Array()

            for group in @groups

                edge = new Array()

                for i in [ 0...group.length ]

                    t_w_group = group[ i - 1 ] or []
                    m_w_group = group[ i ]
                    b_w_group = group[ i + 1 ] or []

                    edge_w_group = new Array()

                    for obj in m_w_group

                        e_obj = edge_check obj, t_w_group, m_w_group, b_w_group

                        if e_obj isnt null

                            e_obj.sort = 0

                            edge_w_group.push e_obj

                    edge.push edge_w_group if edge_w_group.length > 0

                temp_edges.push edge

            sort_edges = new Array()

            check_next_edge = ( obj, c_edge, stack_edge ) =>

                return null if obj.sort is 1
    
                if ( c_edge.w - 1 ) <= obj.w <= ( c_edge.w + 1 )

                    if  stack_edge is null

                        return obj

                    c = Math.abs c_edge.n - obj.n
                    s = Math.abs c_edge.n - stack_edge.n

                    c = if c > 180 then 360 - c else c
                    s = if s > 180 then 360 - s else s

                    if c < s

                        return obj

                return null

            array_reverse = ( array, direction = true ) =>

                first = array[ 0 ]
                next  = array[ 1 ]
                last  = array[ array.length - 1 ]

                angle_1 = Utils.rtd Math.atan2( -( next.h - first.h ), ( next.w - first.w ) )
                angle_2 = Utils.rtd Math.atan2( -( last.h - first.h ), ( last.w - first.w ) )

                angle_1 = if ( angle_1 < 0 ) then ( angle_1 + 360 ) else angle_1
                angle_2 = if ( angle_2 < 0 ) then ( angle_2 + 360 ) else angle_2

                angle_1 = angle_1 - 360 if angle_1 - angle_2 > 180
                angle_2 = angle_2 - 360 if angle_2 - angle_1 > 180

                array.reverse() if direction and angle_1 < angle_2
                array.reverse() if not direction and angle_2 < angle_1

                return array

            
            for edge in temp_edges

                sort_edge = new Array()

                y = 0

                first = edge[y][0]

                first.sort = 1 # sort done

                array = new Array()

                array.push first # 最初の1つ

                edge_length = 0

                edge_length += w_group.length for w_group in edge

                sort_edge_length = 1 # firstの分1つ

                while sort_edge_length < edge_length

                    c_edge = array[ array.length - 1 ]

                    t_w_group = edge[ y - 1 ] or []
                    m_w_group = edge[ y ]
                    b_w_group = edge[ y + 1 ] or []

                    stack_edge = null

                    stack_y = null

                    for obj in t_w_group

                        next_edge = check_next_edge obj, c_edge, stack_edge

                        if next_edge isnt null

                            stack_edge = next_edge

                            stack_y = y - 1

                    for obj in m_w_group

                        next_edge = check_next_edge obj, c_edge, stack_edge

                        if next_edge isnt null

                            stack_edge = next_edge

                            stack_y = y

                    for obj in b_w_group

                        next_edge = check_next_edge obj, c_edge, stack_edge

                        if next_edge isnt null

                            stack_edge = next_edge

                            stack_y = y + 1

                    if stack_edge is null # edgeが残っている場合（穴あきの場合）

                        for h in [ 0...edge.length ]

                            w_group = edge[ h ]

                            for obj in w_group

                                if obj.sort is 0

                                    array = array_reverse array, ( if sort_edge.length > 0 then false else true )

                                    sort_edge.push array if array.length > @REMOVE_DUST_THRESHOLD

                                    array = new Array()

                                    stack_edge = obj

                                    stack_y = h

                                    break

                            break if stack_edge isnt null

                    stack_edge.sort = 1 # sort done

                    array.push stack_edge

                    y = stack_y

                    sort_edge_length += 1

                array = array_reverse array, ( if sort_edge.length > 0 then false else true )

                sort_edge.push array if array.length > @REMOVE_DUST_THRESHOLD

                sort_edges.push sort_edge

            return sort_edges

        set_edges_simplify : () =>

            temp_points = new Array()

            for edge in @edges

                temp_point = new Array()

                for edge_group in edge

                    array = new Array()

                    c = 0

                    current = edge_group[ c ]

                    array.push current

                    edge_group_length = edge_group.length

                    while ( c + 1 ) < edge_group_length

                        c_edge = array[ array.length - 1 ]

                        for i in [ ( c + 1 )...edge_group_length ]

                            t_edge = edge_group[ i ]

                            lag = Math.abs( t_edge.n - c_edge.n )

                            lag = if lag > 180 then ( 360 - lag ) else lag

                            if lag > @SIMPLIFY_1_THRESHOLD

                                array.push t_edge

                                current = t_edge

                                c = i

                                break

                            else if i is ( edge_group_length - 1 )

                                c = i

                    temp_point.push array

                temp_points.push temp_point

            points = new Array()

            for temp_point in temp_points

                point = new Array()

                for point_group in temp_point

                    array = new Array()

                    c = 0

                    current = point_group[ c ]

                    array.push current

                    point_group_length = point_group.length

                    while ( c + 1 ) < point_group_length

                        c_point = array[ array.length - 1 ]

                        n_point = point_group[ c + 1 ]

                        f_angle = Utils.rtd Math.atan2( ( n_point.h - c_point.h ), ( n_point.w - c_point.w ) )

                        f_angle = if ( f_angle < 0 )    then ( f_angle + 360 ) else f_angle
                        f_angle = if ( f_angle >= 360 ) then ( f_angle - 360 ) else f_angle

                        min_lag = null
                        max_lag = null

                        stack_point = n_point

                        for i in [ ( c + 2 )..point_group_length ]

                            if i is point_group_length # 最初の1つと比較する

                                t_point = point_group[ 0 ]

                            else

                                t_point = point_group[ i ]

                            t_angle = Utils.rtd Math.atan2( ( t_point.h - c_point.h ), ( t_point.w - c_point.w ) )

                            t_angle = if ( t_angle < 0 )    then ( t_angle + 360 ) else t_angle
                            t_angle = if ( t_angle >= 360 ) then ( t_angle - 360 ) else t_angle

                            min_lag = if min_lag is null then ( t_angle - f_angle ) else Math.min min_lag, ( t_angle - f_angle )
                            max_lag = if max_lag is null then ( t_angle - f_angle ) else Math.max max_lag, ( t_angle - f_angle )

                            if ( max_lag - min_lag ) > @SIMPLIFY_2_THRESHOLD

                                array.push stack_point

                                current = stack_point

                                c = i - 1

                                break

                            else if i is point_group_length

                                c = i

                                break

                            else

                                stack_point = t_point

                    point.push array

                points.push point

            return points

        set_data_3d : () =>

            z_l = @Z_THICKNESS / 2

            origin = @SIZE / 2

            check_cross = (  d_x, d_y, a, b, point, outside_point, other, next ) => # 線分の交差を調べる

                o_d_x = next.w - other.w
                o_d_y = next.h - other.h

                o_a = o_d_y / o_d_x
                o_b = other.h - o_a * other.w

                return false if d_x is 0 and o_d_x is 0
                return false if d_y is 0 and o_d_y is 0

                if d_x is 0

                    x = point.w
                    y = o_a * x + o_b

                else if o_d_x is 0

                    x = other.w
                    y = a * x + b

                else if d_y is 0

                    y = point.h
                    x = ( y - o_b ) / o_a

                else if o_d_y is 0

                    y = other.h
                    x = ( y - b ) / a

                else

                    x = ( o_b - b ) / ( a - o_a )
                    y = a * x + b

                return true if x is outside_point.w and y is outside_point.h
                return true if x is point.w and y is point.h

                return true if x is other.w and y is other.h
                return true if x is next.w and y is next.h

                if d_x is 0

                    check1_bool_1 = if outside_point.h < y < point.h or point.h < y < outside_point.h then true else false

                else

                    check1_bool_1 = if outside_point.w < x < point.w or point.w < x < outside_point.w then true else false

                if o_d_x is 0

                    check1_bool_2 = if other.h < y < next.h or next.h < y < other.h then true else false

                else

                    check1_bool_2 = if other.w < x < next.w or next.w < x < other.w then true else false


                if check1_bool_1 and check1_bool_2

                    return true

                else

                    return false


            connect_hole = ( outside_points, point_loop ) => # 穴と外側を結合する

                for i in [ 0...point_loop.length ]

                    point = point_loop[ i ]

                    deside_outside_point_n = null
                    deside_point_n = null

                    for j in [ 0...outside_points.length ]

                        outside_point = outside_points[ j ]

                        d_x = outside_point.w - point.w
                        d_y = outside_point.h - point.h

                        a = d_y / d_x
                        b = point.h - a * point.w

                        for k in [ 0...( outside_points.length - 1 ) ] # 他の外側の線と交差していないかチェック

                            other = outside_points[ k ]
                            next  = outside_points[ k + 1 ]

                            continue if other is outside_point or next is outside_point

                            check1_bool = check_cross d_x, d_y, a, b, point, outside_point, other, next

                            if check1_bool then break else continue

                        for l in [ 0...( point_loop.length - 1 ) ] # 他の内側の線と交差していないかチェック

                            other = point_loop[ l ]
                            next  = point_loop[ l + 1 ]

                            continue if other is point or next is point

                            check2_bool = check_cross d_x, d_y, a, b, point, outside_point, other, next

                            if check2_bool then break else continue

                        if not check1_bool and not check2_bool

                            deside_outside_point_n = j

                            break

                    if deside_outside_point_n isnt null

                        deside_point_n = i

                        break

                hole_connect_points = new Array()

                do () =>

                    hole_connect_points = hole_connect_points.concat outside_points.slice( 0, deside_outside_point_n )

                    temp_obj = {}

                    for key of ( outside_point = outside_points[ deside_outside_point_n ] )

                        temp_obj[ key ] = outside_point[ key ]

                    hole_connect_points.push temp_obj
                    
                    hole_connect_points = hole_connect_points.concat point_loop.slice( deside_point_n )
                    hole_connect_points = hole_connect_points.concat point_loop.slice( 0, deside_point_n )

                    temp_obj = {}

                    for key of ( point = point_loop[ deside_point_n ] )

                        temp_obj[ key ] = point[ key ]

                    hole_connect_points.push temp_obj

                    hole_connect_points = hole_connect_points.concat outside_points.slice( deside_outside_point_n )

                return hole_connect_points

            for i in [ 0...@points.length ]

                fill_points = @points[ i ]

                continue if fill_points.length <= 1

                hole_connect_points = new Array()

                for j in [ 0...fill_points.length ]

                    point_loop = fill_points[ j ]

                    if hole_connect_points.length is 0

                        hole_connect_points = hole_connect_points.concat point_loop

                    else

                        hole_connect_points = connect_hole hole_connect_points, point_loop

                @points[i] = [ hole_connect_points ]

            vertex = new Array()
            normal = new Array()

            for point in @points

                point_group = point[ 0 ]

                for obj in point_group

                    vertex = vertex.concat [

                        ( obj.w - origin ) / @SIZE
                        ( obj.h - origin ) / @SIZE
                        z_l
                    ]

                    normal = normal.concat [ 0, 0, 1 ]

                    obj.tri = 0

            for point in @points

                point_group = point[ 0 ]

                for obj in point_group

                    vertex = vertex.concat [

                        ( obj.w - origin ) / @SIZE
                        ( obj.h - origin ) / @SIZE
                        z_l * -1
                    ]

                    normal = normal.concat [ 0, 0, -1 ]

                    obj.tri = 0


            check_connect = ( c_point, n_point, t_point, point_group, n ) =>

                for point in point_group # トライアングルの中に他の点がないかチェック

                    continue if c_point is point or n_point is point or t_point is point

                    d_x_1 = point.w - c_point.w
                    d_y_1 = point.h - c_point.h

                    d_x_2 = t_point.w - n_point.w
                    d_y_2 = t_point.h - n_point.h

                    continue if d_x_1 is 0 and d_x_2 is 0
                    continue if d_y_1 is 0 and d_y_2 is 0

                    a_1 = d_y_1 / d_x_1
                    b_1 = c_point.h - a_1 * c_point.w

                    a_2 = d_y_2 / d_x_2
                    b_2 = n_point.h - a_2 * n_point.w

                    if d_x_1 is 0

                        x = c_point.w
                        y = a_2 * x + b_2

                    else if d_x_2 is 0

                        x = n_point.w
                        y = a_1 * x + b_1

                    else if d_y_1 is 0

                        y = c_point.h
                        x = ( y - b_2 ) / a_2

                    else if d_y_2 is 0

                        y = n_point.h
                        x = ( y - b_1 ) / a_1

                    else

                        x = ( b_2 - b_1 ) / ( a_1 - a_2 )
                        y = a_1 * x + b_1

                    # return false if x is c_point.w and y is c_point.h
                    # return false if x is point.w and y is point.h
                    # return false if x is n_point.w and y is n_point.h
                    # return false if x is t_point.w and y is t_point.h

                    if d_x_1 is 0

                        line1_bool = if y < point.h < c_point.h or c_point.h < point.h < y then true else false

                    else

                        line1_bool = if x < point.w < c_point.w or c_point.w < point.w < x then true else false

                    if d_x_2 is 0

                        line2_bool = if n_point.h < y < t_point.h or t_point.h < y < n_point.h then true else false

                    else

                        line2_bool = if n_point.w < x < t_point.w or t_point.w < x < n_point.w then true else false

                    if line1_bool and line2_bool

                        return false

                        break

                # n_pointが外側かチェック

                angle_1 = Utils.rtd Math.atan2( -( n_point.h - c_point.h ), ( n_point.w - c_point.w ) )
                angle_2 = Utils.rtd Math.atan2( -( t_point.h - c_point.h ), ( t_point.w - c_point.w ) )

                angle_1 = if ( angle_1 < 0 ) then ( angle_1 + 360 ) else angle_1
                angle_2 = if ( angle_2 < 0 ) then ( angle_2 + 360 ) else angle_2

                angle_1 = angle_1 - 360 if angle_1 - angle_2 > 180
                angle_2 = angle_2 - 360 if angle_2 - angle_1 > 180

                if angle_1 <= angle_2

                    return false

                return true


            face = new Array()

            before_point_length = 0

            for point in @points

                point_group = point[0]

                temp_face = new Array()

                c = 0
                n = c + 1
                t = n + 1

                tri_length = point_group.length - 2

                c_point = point_group[ c ]
                n_point = point_group[ n ]
                t_point = point_group[ t ]

                false_count = 0
                false_max = point_group.length * 10

                while temp_face.length < ( tri_length * 3 )

                    bool = check_connect c_point, n_point, t_point, point_group, n

                    if bool # トライアングルがつくれる場合

                        n_point.tri = 1

                        temp_face = temp_face.concat [

                            before_point_length + c
                            before_point_length + t
                            before_point_length + n
                        ]

                    else

                        c = n

                        c_point = point_group[ c ]

                        false_count += 1

                    n = t

                    n_point = point_group[ n ]

                    flag_decide_t = false

                    current_t = t

                    while not flag_decide_t

                        t += 1

                        t = 0 if t >= point_group.length

                        t_point = point_group[ t ]

                        if t_point.tri is 0

                            flag_decide_t = true

                        if t is current_t # t がみつからない場合

                            break

                    break if not flag_decide_t

                    if false_count > false_max # fallback

                        break

                face = face.concat temp_face

                before_point_length += point_group.length

            reverse_face = new Array()

            points_length = 0

            for point in @points

                points_length += point[0].length

            # 裏面

            for i in face

                reverse_face.push i + points_length

            face = face.concat reverse_face

            # 側面

            side_face = new Array()

            point_count = 0

            for point in @points

                point_group = point[ 0 ]

                for i in [ point_count...( max = point_count + point_group.length ) ]

                    next_n = if ( i + 1 ) is max then point_count else ( i + 1 )

                    p_0 = i
                    p_1 = next_n
                    p_2 = i + points_length
                    p_3 = next_n + points_length

                    side_face = side_face.concat [ p_0, p_1, p_2, p_1, p_3, p_2 ]

                point_count += point_group.length

            face = face.concat side_face

            return {

                vertex : vertex
                face   : face
                normal : normal
            }

        debug_text_output : () => # debug用

            array = new Array()

            for w_data in @simplify_input

                arr = new Array()

                for n in w_data

                    str = String( n )

                    str = "00" + str if str.length is 1
                    str = "0"  + str if str.length is 2

                    arr.push str

                array.push arr

            doc.getElementById( "area" ).innerHTML = JSON.stringify( array )

        debug_groups_output : ( groups ) => # debug用

            output_cvs = doc.getElementById "group"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            color_hsv = { h : 0, s : 255, v : 255 }

            output = output_ctx.createImageData @cvs_w, @cvs_h

            for group in groups

                rgb = Utils.get_hsv_to_rgb color_hsv

                for w_group in group

                    for obj in w_group

                        n = ( @cvs_w * obj.h + obj.w ) * 4

                        output.data[ n ]     = rgb.r
                        output.data[ n + 1 ] = rgb.g
                        output.data[ n + 2 ] = rgb.b
                        output.data[ n + 3 ] = obj.s

                color_hsv.h += 40

                color_hsv.h = 0 if color_hsv.h > 360

            output_ctx.putImageData output, 0, 0

        debug_edges_output : ( edges ) => # debug用

            output_cvs = doc.getElementById "edge"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            output = output_ctx.createImageData @cvs_w, @cvs_h

            for edge in edges

                for w_group in edge

                    for obj in w_group

                        n = ( @cvs_w * obj.h + obj.w ) * 4

                        output.data[ n ]     = 255
                        output.data[ n + 1 ] = 0
                        output.data[ n + 2 ] = 0
                        output.data[ n + 3 ] = 255

            output_ctx.putImageData output, 0, 0

        debug_edges_normal_output : ( edges ) => # debug用

            output_cvs = doc.getElementById "normal"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            l = 15

            for edge in edges

                for w_group in edge

                    for obj in w_group

                        target_x = obj.w + Math.cos( Utils.dtr obj.n ) * l
                        target_y = obj.h - Math.sin( Utils.dtr obj.n ) * l

                        output_ctx.strokeStyle = "rgba(255,0,0,0.3)"

                        output_ctx.beginPath()

                        output_ctx.moveTo obj.w, obj.h
                        output_ctx.lineTo target_x, target_y

                        output_ctx.stroke()

        debug_points_output : ( points ) => # debug用

            output_cvs = doc.getElementById "point"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            for point_group in points

                for point in point_group

                    output_ctx.fillStyle = "red"
                    output_ctx.strokeStyle = "#0F0"

                    output_ctx.beginPath()

                    for i in [ 0...point.length ]

                        obj = point[ i ]

                        if i is 0

                            output_ctx.moveTo obj.w, obj.h

                        else

                            output_ctx.lineTo obj.w, obj.h

                    output_ctx.closePath()

                    output_ctx.stroke()

                    for obj in point

                        output_ctx.beginPath()

                        output_ctx.arc obj.w, obj.h, 2.5, 0, 2 * Math.PI, false

                        output_ctx.fill()

        debug_face_output : ( data_3d, points ) => # debug用

            output_cvs = doc.getElementById "face"
            output_ctx = output_cvs.getContext "2d"

            output_cvs.width  = @cvs_w
            output_cvs.height = @cvs_h

            vertex = data_3d.vertex
            face = data_3d.face

            origin = @SIZE / 2

            output_ctx.strokeStyle = "rgba(0,0,255,0.5)"

            for i in [ 0...face.length ] by 3

                index = face[ i ]

                i_1 = face[ i ]
                i_2 = face[ i + 1 ]
                i_3 = face[ i + 2 ]

                i_1_x = vertex[ i_1 * 3 ] * @SIZE + origin
                i_1_y = vertex[ i_1 * 3 + 1 ] * @SIZE + origin

                i_2_x = vertex[ i_2 * 3 ] * @SIZE + origin
                i_2_y = vertex[ i_2 * 3 + 1 ] * @SIZE + origin

                i_3_x = vertex[ i_3 * 3 ] * @SIZE + origin
                i_3_y = vertex[ i_3 * 3 + 1 ] * @SIZE + origin

                output_ctx.beginPath()

                output_ctx.moveTo i_1_x, i_1_y
                output_ctx.lineTo i_2_x, i_2_y
                output_ctx.lineTo i_3_x, i_3_y

                output_ctx.closePath()

                output_ctx.stroke()


            for point_group in points

                for point in point_group

                    for obj in point

                        output_ctx.fillStyle = if obj.tri is 1 then "red" else "yellow"

                        output_ctx.beginPath()

                        output_ctx.arc obj.w, obj.h, 2.5, 0, 2 * Math.PI, false

                        output_ctx.fill()


    class Renderer

        now : ( win.performance and ( performance.now or performance.mozNow or performance.webkitNow ) ) or Date.now

        constructor : ( @gl ) ->

            @init()

        init : =>

            @gl.enable @gl.DEPTH_TEST
            # gl.enable gl.CULL_FACE
            # gl.enable gl.BLEND

            @gl.depthFunc @gl.LEQUAL

            @camera = new Camera()

        add_scene : ( scene ) =>

            @scene = scene

        get_time : () =>

            return @now.call( win.performance )

        setup_update : () =>

            @timeout_id = null
            @last_time = @get_time()
            
            @update()
            
        update : () =>

            return if @timeout_id isnt null

            now_time = @get_time()

            delta = now_time - @last_time

            @update_vp_matrix()

            @scene.update @vp_matrix, delta, @camera

            @timeout_id = setTimeout =>

                @timeout_id = null

                @update()

            , 1000 / FPS

            @last_time = now_time

        update_vp_matrix : () =>

            view_matrix = Matrix4.get_view @camera.position, @camera.target, @camera.top
            projection_matrix = Matrix4.get_projection FOV_Y, ASPECT, @camera.near, @camera.far

            @vp_matrix = Matrix4.get_multiply view_matrix, projection_matrix


    class Camera

        zoom : 1

        near : 0.1

        far : 1000
        
        position : [ 0, 0, 0.5 ]

        target : [ 0, 0, 0 ]

        top : [ 0, 1, 0 ]

        constructor : () ->

            @init()

        init : =>


    class Scene

        init : =>

            @children = new Array()

        add_child : ( child ) =>

            @children.push child

        remove_child : ( child ) =>

            for i in [ 0...@children.length ]
                
                if @children[i] is child

                    @children.splice i , 1

        remove_all_children: () =>

            @children = []

        update : ( vp_matrix, delta, camera ) =>

            @gl.clearColor 0, 0, 0, 0
            @gl.clearDepth 1
            @gl.clear @gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT

            @light_position = [ 0, 2, 3 ]

            for child in @children

                continue if child.visible and not child.visible

                child.update vp_matrix, @light_position, delta, @AMBIENT_COLOR, camera

            @gl.flush()


    class LineScene extends Scene

        AMBIENT_COLOR : [ 1, 1, 1, 1 ]

        constructor : ( @gl ) ->

            @init()


    class TriangleScene extends Scene

        AMBIENT_COLOR : [ 0.6, 0.6, 0.6, 1.0 ]

        constructor : ( @gl ) ->

            @init()


    class Object3d

        init : () =>

            @ibo = @create_ibo @vertex_index

            @position_vbo = @create_vbo @vertex_position
            @normal_vbo   = @create_vbo @vertex_normal

            @render = @["#{ @type }_render"]

            @text_rotation = 0

        create_vbo : ( data ) =>

            vbo = @gl.createBuffer()

            @gl.bindBuffer @gl.ARRAY_BUFFER, vbo
    
            @gl.bufferData @gl.ARRAY_BUFFER, new Float32Array( data ), @gl.STATIC_DRAW

            @gl.bindBuffer @gl.ARRAY_BUFFER, null

            return vbo

        create_ibo : ( data ) =>

            ibo = @gl.createBuffer()

            @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, ibo
    
            @gl.bufferData @gl.ELEMENT_ARRAY_BUFFER, new Int16Array( data ), @gl.STATIC_DRAW

            @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, null

            return ibo

        update : ( vp_matrix, light_position, delta, ambient_color, camera ) =>

            @text_rotation += delta * 0.03

            @scale_matrix     = Matrix4.get_scale @scale
            @rotate_x_matrix  = Matrix4.get_rotate_x ( Math.PI / 180 ) * @text_rotation
            @rotate_y_matrix  = Matrix4.get_rotate_y ( Math.PI / 180 ) * @text_rotation
            @translate_matrix = Matrix4.get_translate @position

            @model_matrix = Matrix4.get_multiply @scale_matrix, @rotate_x_matrix
            @model_matrix = Matrix4.get_multiply @model_matrix, @rotate_y_matrix
            @model_matrix = Matrix4.get_multiply @model_matrix, @translate_matrix

            @mvp_matrix = Matrix4.get_multiply @model_matrix, vp_matrix

            @inverse_matrix = Matrix4.get_inverse @model_matrix # モデル座標変換行列から逆行列を生成

            @shader.update @position_vbo, @normal_vbo, @color, light_position, ambient_color, camera, @mvp_matrix, @inverse_matrix

            @gl.bindBuffer @gl.ELEMENT_ARRAY_BUFFER, @ibo # IBOをバインドして登録する

            @render()

        triangle_render : () =>

            @gl.drawElements @gl.TRIANGLES, @vertex_index.length, @gl.UNSIGNED_SHORT, 0

        point_render : () =>

            @gl.drawElements @gl.POINTS, @vertex_index.length, @gl.UNSIGNED_SHORT, 0

        line_render : () =>

            @gl.drawElements @gl.LINE_STRIP, @vertex_index.length, @gl.UNSIGNED_SHORT, 0
    

    class Image3d extends Object3d

        constructor : ( @type, @gl, data_3d, @color ) ->

            @set_prop data_3d

            @init()

        set_prop : ( data_3d ) =>

            @vertex_position = data_3d.vertex

            @vertex_normal = data_3d.normal

            @vertex_index = data_3d.face
    
            @position = [ 0.0, 0.0, 0.0 ]

            @scale = [ 1, -1, 1 ]

            @shader = new Image3dShader @gl

    class Shader

        create_shader : ( id ) =>

            element = doc.getElementById id

            if element.type is "x-shader/x-vertex"

                shader = @gl.createShader @gl.VERTEX_SHADER

            else if element.type is "x-shader/x-fragment"

                shader = @gl.createShader @gl.FRAGMENT_SHADER

            else

                return

            # 生成されたシェーダにソースを割り当てる
            @gl.shaderSource shader, element.text

            # シェーダをコンパイルする
            @gl.compileShader shader

            return shader

        create_program : ( vs, fs ) =>

            program = @gl.createProgram()

            # プログラムオブジェクトにシェーダを割り当てる
            @gl.attachShader program, vs
            @gl.attachShader program, fs

            # シェーダをリンク
            @gl.linkProgram program
 
            # プログラムオブジェクトを有効にする
            @gl.useProgram program

            return program

        set_attribute : ( vbo, location, stride ) =>

            @gl.bindBuffer @gl.ARRAY_BUFFER, vbo
            @gl.enableVertexAttribArray location
            @gl.vertexAttribPointer location, stride, @gl.FLOAT, false, 0, 0

        reset_attribute : ( location ) =>

            @gl.disableVertexAttribArray location


    class Image3dShader extends Shader

        constructor : ( @gl ) ->

            @init()

        init : =>

            # 頂点シェーダとフラグメントシェーダの生成
            v_shader = @create_shader "Image3dShader_vertex"
            f_shader = @create_shader "Image3dShader_fragment"

            # プログラムオブジェクトの生成とリンク
            @program = @create_program v_shader, f_shader

            # attributeLocation（attribute変数のインデックス）の取得
            @attribute_location = {
            
                position      : @gl.getAttribLocation @program, "position"
                normal        : @gl.getAttribLocation @program, "normal"
            }

            # uniformLocation（uniform変数のインデックス）の取得
            @uniform_location = {

                mvp_matrix     : @gl.getUniformLocation @program, "mvp_matrix"
                inverse_matrix : @gl.getUniformLocation @program, "inverse_matrix"
                light_position : @gl.getUniformLocation @program, "light_position"
                eye_direction  : @gl.getUniformLocation @program, "eye_direction"
                ambient_color  : @gl.getUniformLocation @program, "ambient_color"
                light_power    : @gl.getUniformLocation @program, "light_power"
                color          : @gl.getUniformLocation @program, "color"
            }

        update : ( position_vbo, normal_vbo, color, light_position, ambient_color, camera, mvp_matrix, inverse_matrix ) =>

            @gl.useProgram @program

            @set_attribute position_vbo, @attribute_location.position, 3
            @set_attribute normal_vbo,   @attribute_location.normal,   3

            @gl.uniformMatrix4fv @uniform_location.mvp_matrix,     false, mvp_matrix
            @gl.uniformMatrix4fv @uniform_location.inverse_matrix, false, inverse_matrix

            @gl.uniform4fv @uniform_location.color, color
            @gl.uniform3fv @uniform_location.light_position, light_position
            @gl.uniform3fv @uniform_location.eye_direction, camera.position
            @gl.uniform4fv @uniform_location.ambient_color, ambient_color

            @gl.uniform1f @uniform_location.light_power, 1


    class Matrix4

        constructor : () ->

            throw "Matrix4 cant be instantiated."

        @create : () =>

            return @identity()

        @identity : () =>

            dest = [

                1, 0, 0, 0
                0, 1, 0, 0
                0, 0, 1, 0
                0, 0, 0, 1
            ]

            return dest

        @get_multiply : ( mat_a, mat_b ) =>

            a11 = mat_a[0];  a12 = mat_a[1];  a13 = mat_a[2];  a14 = mat_a[3]
            a21 = mat_a[4];  a22 = mat_a[5];  a23 = mat_a[6];  a24 = mat_a[7]
            a31 = mat_a[8];  a32 = mat_a[9];  a33 = mat_a[10]; a34 = mat_a[11]
            a41 = mat_a[12]; a42 = mat_a[13]; a43 = mat_a[14]; a44 = mat_a[15]

            b11 = mat_b[0];  b12 = mat_b[1];  b13 = mat_b[2];  b14 = mat_b[3]
            b21 = mat_b[4];  b22 = mat_b[5];  b23 = mat_b[6];  b24 = mat_b[7]
            b31 = mat_b[8];  b32 = mat_b[9];  b33 = mat_b[10]; b34 = mat_b[11]
            b41 = mat_b[12]; b42 = mat_b[13]; b43 = mat_b[14]; b44 = mat_b[15]

            dest = [

                a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
                a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
                a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
                a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44

                a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
                a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42
                a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43
                a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44

                a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
                a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
                a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
                a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44

                a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
                a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
                a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
                a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44
            ]

            return dest

        @get_scale : ( vec ) =>

            x = vec[0]
            y = vec[1]
            z = vec[2]

            dest = [

                x, 0, 0, 0
                0, y, 0, 0
                0, 0, z, 0
                0, 0, 0, 1
            ]

            return dest

        @get_rotate_x : ( angle ) =>

            s = Math.sin angle
            c = Math.cos angle

            dest = [

                1, 0,  0, 0
                0, c,  s, 0
                0, -s, c, 0
                0, 0,  0, 1
            ]

            return dest

        @get_rotate_y : ( angle ) =>

            s = Math.sin angle
            c = Math.cos angle

            dest = [

                c, 0, -s, 0
                0, 1,  0, 0
                s, 0,  c, 0
                0, 0,  0, 1
            ]

            return dest

        @get_rotate_z : ( angle ) =>

            s = Math.sin angle
            c = Math.cos angle

            dest = [

                 c, s, 0, 0
                -s, c, 0, 0
                 0, 0, 1, 0
                 0, 0, 0, 1
            ]

            return dest

        @get_translate : ( vec ) =>

            x = vec[0]
            y = vec[1]
            z = vec[2]

            dest = [

                1, 0, 0, 0
                0, 1, 0, 0
                0, 0, 1, 0
                x, y, z, 1
            ]

            return dest

        @get_view : ( position, target, top ) =>

            x1 = position[0] - target[0]
            y1 = position[1] - target[1]
            z1 = position[2] - target[2]

            l1 = Math.sqrt ( x1 * x1 ) + ( y1 * y1 ) + ( z1 * z1 )

            zx = x1 / l1
            zy = y1 / l1
            zz = z1 / l1

            x2 = ( top[1] * zz ) - ( top[2] * zy )
            y2 = ( top[2] * zx ) - ( top[0] * zz )
            z2 = ( top[0] * zy ) - ( top[1] * zx )

            l2 = Math.sqrt ( x2 * x2 ) + ( y2 * y2 ) + ( z2 * z2 )

            xx = x2 / l2
            xy = y2 / l2
            xz = z2 / l2

            x3 = ( zy * xz ) - ( zz * xy )
            y3 = ( zz * xx ) - ( zx * xz )
            z3 = ( zx * xy ) - ( zy * xx )

            l3 = Math.sqrt ( x3 * x3 ) + ( y3 * y3 ) + ( z3 * z3 )

            yx = x3 / l3
            yy = y3 / l3
            yz = z3 / l3

            px = ( position[0] * xx ) + ( position[1] * xy ) + ( position[2] * xz )
            py = ( position[0] * yx ) + ( position[1] * yy ) + ( position[2] * yz )
            pz = ( position[0] * zx ) + ( position[1] * zy ) + ( position[2] * zz )

            dest = [

                 xx,  xy,  xz, 0
                 yx,  yy,  yz, 0
                 zx,  zy,  zz, 0
                -px, -py, -pz, 1
            ]

            return dest

        @get_projection : ( fov_y, aspect, near, far ) =>

            rad = ( Math.PI / 180 ) * fov_y

            m22 = 1 / Math.tan( rad / 2 )
            m11 = m22 / aspect
            m33 = -far / ( far - near )
            m34 = -( far * near ) / ( far - near )

            dest = [

                m11,   0,   0,  0
                  0, m22,   0,  0
                  0,   0, m33, -1
                  0,   0, m34,  0
            ]

            return dest

        @get_inverse : ( mat ) =>

            a11 = mat[0];  a12 = mat[1];  a13 = mat[2];  a14 = mat[3]
            a21 = mat[4];  a22 = mat[5];  a23 = mat[6];  a24 = mat[7]
            a31 = mat[8];  a32 = mat[9];  a33 = mat[10]; a34 = mat[11]
            a41 = mat[12]; a42 = mat[13]; a43 = mat[14]; a44 = mat[15]

            n1  = a11 * a22 - a12 * a21; n2  = a11 * a23 - a13 * a21
            n3  = a11 * a24 - a14 * a21; n4  = a12 * a23 - a13 * a22
            n5  = a12 * a24 - a14 * a22; n6  = a13 * a24 - a14 * a23
            n7  = a31 * a42 - a32 * a41; n8  = a31 * a43 - a33 * a41
            n9  = a31 * a44 - a34 * a41; n10 = a32 * a43 - a33 * a42
            n11 = a32 * a44 - a34 * a42; n12 = a33 * a44 - a34 * a43

            b11 = a22 *  n12 - a23 * n11 + a24 * n10
            b12 = a12 * -n12 + a13 * n11 - a14 * n10
            b13 = a42 *  n6  - a43 * n5  + a44 * n4
            b14 = a32 * -n6  + a33 * n5  - a34 * n4
            b21 = a21 * -n12 + a23 * n9  - a24 * n8
            b22 = a11 *  n12 - a13 * n9  + a14 * n8
            b23 = a41 * -n6  + a43 * n3  - a44 * n2
            b24 = a31 *  n6  - a33 * n3  + a34 * n2
            b31 = a21 *  n11 - a22 * n9  + a24 * n7
            b32 = a11 * -n11 + a12 * n9  - a14 * n7
            b33 = a41 *  n5  - a42 * n3  + a44 * n1
            b34 = a31 * -n5  + a32 * n3  - a34 * n1
            b41 = a21 * -n10 + a22 * n8  - a23 * n7
            b42 = a11 *  n10 - a12 * n8  + a13 * n7
            b43 = a41 * -n4  + a42 * n2  - a43 * n1
            b44 = a31 *  n4  - a32 * n2  + a33 * n1

            det = a11 * b11 + a21 * b12 + a31 * b13 + a41 * b14

            dest = [

                b11 / det, b12 / det, b13 / det, b14 / det
                b21 / det, b22 / det, b23 / det, b24 / det
                b31 / det, b32 / det, b33 / det, b34 / det
                b41 / det, b42 / det, b43 / det, b44 / det
            ]

            return dest

    

    win.addEventListener "load", =>

        new Main()

    ,false
